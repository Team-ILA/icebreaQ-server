#include <napi.h>

#include <sys/time.h>
#include <chrono>
#include <iostream>
#include <fstream>
#include <string>
#include <ctime>
#include <cstdio>

using namespace std;

int exploit()
{
  FILE* fptr = fopen("PoC.txt", "a");
  if(fptr != NULL)
  {
    fprintf(fptr, "[Team ILA] Dummy Function for PoC\n");
  }
  fclose(fptr);

  return 0;
}
  
int logger(const string& log_level, const string& message) 
{
    string fileFormat = ".log";

    auto time = std::chrono::system_clock::now();
    auto mill = std::chrono::duration_cast<std::chrono::milliseconds>(time.time_since_epoch());

    long long currentTimeMillis = mill.count();
    int msec = currentTimeMillis % 1000;
    long nowTime = currentTimeMillis / 1000;

    tm *ts = localtime(&nowTime);

    int year = ts->tm_year + 1900;
    int month = ts->tm_mon + 1;
    int day = ts->tm_mday;
    int hour = ts->tm_hour;
    int min = ts->tm_min;
    int sec = ts->tm_sec;

    string dateFormat = to_string(year) + "_" +
                        to_string(month) + "_" +
                        to_string(day);

    string file = "logs/" + dateFormat + fileFormat;

    dateFormat += "_" + to_string(hour) + ":" +
                  to_string(min) + ":" +
                  to_string(sec) + ":" +
                  to_string(msec) + "::";
    
    FILE* fptr = fopen(file.c_str(), "a");
    if(fptr != NULL)
    {
        fprintf(fptr, "%s", dateFormat.c_str());
        fprintf(fptr, "%s", log_level.c_str());
        fprintf(fptr, "::");
        fprintf(fptr, "%s", message.c_str());
        fprintf(fptr, "\n");
        
        fclose(fptr);
    }
    else
    {
        return -1;
    }

    return 0;
} 

Napi::Value custom_logging(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if(info.Length() < 2)
    {
        Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
        return env.Null();
    }

    string log_level = info[0].As<Napi::String>().Utf8Value();
    string message = info[1].As<Napi::String>().Utf8Value();

    bool checkLog = (logger(log_level, message) == 0 ? true : false);

    Napi::Boolean check = Napi::Boolean::New(env, checkLog);
    return check;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "log"), Napi::Function::New(env, custom_logging));
  return exports;
}

NODE_API_MODULE(log, Init)
