#include <iostream>
#include <fstream>
#include <filesystem>

#include <liblas/liblas.hpp>
#include <opencv4/opencv2/core.hpp>
#include <opencv4/opencv2/core/mat.hpp>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

/*
json format
{
    "lasPath": "/mnt/c/.../aaa.las"
    "boxes":[
        {
            "matrix":[1.0, 2.0, .... 16.0],  // 16 doubles
            "intensity": 1 // integer
        },
        {

        }
    ]
}
*/
string formatNumber(int number, int unit);
int clipLas(string lasPath, string outPath, cv::Mat matrix, int inetensity);

int main(int argc, char** argv) {
    if (argc < 2) {
        cout << "input your json file!" << endl;
        return 1;
    }

    string jsonPath(argv[1]);
    ifstream jsonFile(jsonPath);
    json data = json::parse(jsonFile);

    filesystem::path lasPath(data["lasPath"]);
    json boxes = data["boxes"];
    for (int i = 0; i < boxes.size(); i++) {
        json box = boxes[i];
        json elements = box["matrix"];
        int intensity = box["intensity"];

        cv::Mat matrix = cv::Mat::zeros(4, 4, CV_64F);
        for (int j = 0; j < 16; j++) {
            double element = elements[j];
            matrix.at<double>(j/4, j%4) = element;
        }

        filesystem::path outPath = lasPath.parent_path();
        outPath += "/box";
        outPath += formatNumber(i, 3);
        outPath += ".las";
        clipLas(lasPath.string(), outPath.string(), matrix.inv().t(), intensity);
    }
    // cout << boxes.size() << endl;
    // double *elements = data[""]
}

std::string formatNumber(int number, int unit) {
    std::string numberStr = std::to_string(number);
    int numZeros = 3 - numberStr.length();

    if (numZeros > 0) {
        std::string zeros(numZeros, '0');
        numberStr = zeros + numberStr;
    }

    return numberStr;
}


int clipLas(string lasPath, string outPath, cv::Mat matrix, int inetensity)
{
    string inputFilePath = "/mnt/c/Users/yeti/Documents/github/data/paris/las/Lille_0.las";  // 입력 바이너리 파일 경로
    string outputFilePath = "/mnt/c/Users/yeti/Documents/github/data/paris/las/0_test.las";  // 출력 LAS 파일 경로

    try {
        ifstream inputFile(inputFilePath, ios::in | ios::binary);
        liblas::Reader reader(inputFile);
        liblas::Header header = reader.GetHeader();
        std::ofstream outputFile(outputFilePath, std::ios::binary);  // 출력 파일 스트림 생성
        liblas::Writer writer(outputFile, reader.GetHeader());  // 출력 파일 스트림을 사용하여 Writer 생성

        int num = 0;

        while(reader.ReadNextPoint()) {
            liblas::Point point = reader.GetPoint();

            double x = point.GetX();
            double y = point.GetY();
            double z = point.GetZ();

            cv::Vec4d vec(x, y, z, 1.0);
            cv::Mat result = matrix * cv::Mat(vec);

            double cx = result.at<double>(0, 0);
            double cy = result.at<double>(1, 0);
            double cz = result.at<double>(2, 0);

            if (cx <= 0.5 && cx >= -0.5 && cy <= 0.5 && cy >= -0.5 && cz <= 0.5 && cz >= -0.5) {
                // cout << "found : " << cx << ",  " << cy << ",  " << cz  << endl;
                num++;
                writer.WritePoint(point);
            }

            // writer.WritePoint(point);
        }

        cout << "found num : "<< num << endl;
    } catch (exception& e) {
        cerr << "LAS 파일 변환 실패: " << e.what() << endl;
        return 1;
    }

    return 0;
}