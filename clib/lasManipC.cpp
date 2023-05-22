#include <iostream>
#include <fstream>
#include <filesystem>
#include <vector>

#include <liblas/liblas.hpp>
#include <opencv4/opencv2/core.hpp>
#include <opencv4/opencv2/core/mat.hpp>
#include <nlohmann/json.hpp>

using namespace std;


string formatNumber(int number, int unit);

class ClipBox {
private:
    // created from constructor
    string outPath;
    cv::Mat matrix;
    uint16_t threshold;
    bool writeLabelLas;

    // clipping tools
    ofstream *outLas;
    ofstream *labelLas;
    liblas::Writer *lasWriter;
    liblas::Writer *labelWriter;
    double cmin[3] = {DBL_MAX, DBL_MAX};
    double cmax[3] = {DBL_MIN, DBL_MIN};

    // craated after clipping
    uint numPoints = 0;
    uint numLabelPoints = 0;
    double min[3] = {0, 0, DBL_MAX};
    double max[3] = {0, 0, DBL_MIN};

public:
    ClipBox(string outPath, double *elements, uint16_t threshold, bool writeLabelLas) {
        this->outPath = outPath;
        this->threshold = threshold;
        this->writeLabelLas = writeLabelLas;

        this->matrix = cv::Mat::zeros(4, 4, CV_64F);
        for (int i = 0; i < 16; i++) {
            this->matrix.at<double>((i/4), (i%4)) = elements[i];
        }
        this->matrix = this->matrix.inv().t();
    }
    ~ClipBox() {
        if (this->lasWriter != nullptr) {
            delete this->lasWriter;
            delete this->outLas;
            if (this->labelWriter != nullptr) {
                delete this->labelWriter;
                delete this->labelLas;
            }
        }
    }

    void setLasHeader(liblas::Header header) {
        this->outLas = new ofstream(this->outPath + ".las", std::ios::binary);
        this->lasWriter = new liblas::Writer(*this->outLas, header);

        if (this->writeLabelLas) {
            this->labelLas = new ofstream(this->outPath + "_label.las", std::ios::binary);
            this->labelWriter = new liblas::Writer(*this->labelLas, header);
        }
    }

    void addPoint(liblas::Point point) {
        double x = point.GetX();
        double y = point.GetY();
        double z = point.GetZ();
        double intensity = point.GetIntensity();

        cv::Vec4d pointVector(x, y, z, 1.0);
        cv::Mat result = this->matrix * cv::Mat(pointVector);
        double cx = result.at<double>(0, 0);
        double cy = result.at<double>(1, 0);
        double cz = result.at<double>(2, 0);

        if (cx <= 0.5 && cx >= -0.5 && cy <= 0.5 && cy >= -0.5 && cz <= 0.5 && cz >= -0.5) // inner point
        {
            this->numPoints++;
            this->lasWriter->WritePoint(point);
            if (intensity >= this->threshold)
            {
                this->numLabelPoints++;
                if (this->writeLabelLas) this->labelWriter->WritePoint(point);

                if (cx < this->cmin[0]) {
                    this->cmin[0] = cx;
                    this->min[0] = x;
                }
                if (cx > this->cmax[0]) {
                    this->cmax[0] = cx;
                    this->max[0] = x;
                }
                if (cy < this->cmin[1]) {
                    this->cmin[1] = cy;
                    this->min[1] = y;
                }
                if (cy > this->cmax[1]) {
                    this->cmax[1] = cy;
                    this->max[1] = y;
                }
                if (z < this->min[2]) this->min[2] = z;
                if (z > this->max[2]) this->max[2] = z;
            }
        }

        
    }

    nlohmann::json exportData() {
        nlohmann::json json;
        json["intensity"] = this->threshold;
        json["num_points"] = this->numPoints;
        json["num_label_points"] = this->numLabelPoints;
        json["min"] = {this->min[0], this->min[1], this->min[2]};
        json["max"] = {this->max[0], this->max[1], this->max[2]};

        double elements[16];
        for (int i = 0; i < 16; i++) {
            elements[i] = this->matrix.at<double>((i/4), (i%4));
        }
        json["matrix"] = elements;

        return json;
    }


};

class ClipTask
{
private:
    nlohmann::json json;
    filesystem::path lasPath;
    filesystem::path dir;
    vector<ClipBox> boxes;

public:
    ClipTask(nlohmann::json json)
    {
        this->json = json;
        this->lasPath = filesystem::path((string)json["lasPath"]);
        this->dir = lasPath.parent_path();

        nlohmann::json boxes = json["boxes"];
        for (int i = 0; i < boxes.size(); i++) {
            nlohmann::json box = boxes[i];
            nlohmann::json matrix = box["matrix"];

            uint16_t intensity = box["intensity"];
            double elements[16];
            for (int j = 0; j < 16; j++) {
                elements[j] = matrix[j];
            }

            filesystem::path outPath = this->dir / formatNumber(i, 6);
            this->boxes.emplace_back(outPath.string(), elements, intensity, true);
        }
    }

    void clip()
    {
        try {
            ifstream las(this->lasPath, ios::in | ios::binary);
            liblas::Reader reader(las);
            liblas::Header header = reader.GetHeader();
            for (auto it = this->boxes.begin(); it != this->boxes.end(); it++) {
                it->setLasHeader(header);
            }

            uint numPoints = header.GetPointRecordsCount();
            uint i = 0;
            while(reader.ReadNextPoint()) {
                if ((i+1) % 100000 == 0) 
                    cout << "(" << i+1 << "/" << numPoints << ") processing." << endl;

                auto point = reader.GetPoint();
                for (auto it = this->boxes.begin(); it != this->boxes.end(); it++) {
                    it->addPoint(point);
                }
                i++;
            }
        } catch(exception &e)
        {
            cerr << "LAS 파일 변환 실패: " << e.what() << endl;
            exit(1);
        }
    }

    void exportData() {
        vector<nlohmann::json> boxes;
        for (auto it = this->boxes.begin(); it != this->boxes.end(); it++) {
            boxes.push_back(it->exportData());
        }
        this->json["boxes"] = boxes;

        filesystem::path outpath = this->dir / "clip.json";
        ofstream outFile(outpath);
        outFile << std::setw(4) << this->json << std::endl;
    }
};


// liblas::Writer *test(liblas::Header header, liblas::Point point) {
//     ofstream *outlas = new ofstream("/mnt/c/Users/yeti/Documents/github/data/paris/las/test.las", std::ios::binary);
//     liblas::Writer *writer = new liblas::Writer(*outlas, header);
//     writer->WritePoint(point);

//     return writer;
// }

int main(int argc, char **argv)
{
    if (argc < 2)
    {
        cout << "input your json file!" << endl;
        return 1;
    }

    // liblas::Header header;
    // liblas::Point point(&header);
    // auto writer = test(header, point);
    // writer->WritePoint(point);


    string jsonPath(argv[1]);
    ifstream jsonFile(jsonPath);
    nlohmann::json data = nlohmann::json::parse(jsonFile);
    ClipTask clipTask(data);
    clipTask.clip();
    clipTask.exportData();
}

string formatNumber(int number, int unit)
{
    std::string numberStr = std::to_string(number);
    int numZeros = unit - numberStr.length();

    if (numZeros > 0)
    {
        std::string zeros(numZeros, '0');
        numberStr = zeros + numberStr;
    }

    return numberStr;
}



///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// JSON FORMAT ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
// input.json
// {
//     "lasPath": "/mnt/c/.../aaa.las"
//     "boxes":[
//         {
//             "matrix":[1.0, 2.0, .... 16.0],  // 16 doubles
//             "intensity": 1 // integer
//         },
//         {

//         }
//     ]
// }
///////////////////////////////////////////////////////////////////////////////////
// output.json
// {
//     "lasPath": "/mnt/c/.../aaa.las"
//     "boxes":[
//         {
//             "matrix":[1.0, 2.0, .... 16.0],  // 16 doubles
//             "intensity": 1, // integer
//             "min": [0.1, 0.3, 1.0], // 3 doubles
//             "max": [13.5, 10.3, 9.3], // 3 dobules
//             "num_points": 10052, // integer
//             "num_label_points": 1310 // integer
//         },
//         {

//         }
//     ]
// }
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////