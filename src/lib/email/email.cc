#include <napi.h>

#include <iostream>
#include <cstring>
#include <string>
#include <regex>

#define BUF_SIZE 100

using namespace std;

//bool checkEmail(const string& email)
bool checkEmail(const char *str)
{
   // define a regular expression
   const regex pattern
      ("(\\w+)(\\.|_)?(\\w*)@(\\w+)(\\.(\\w+))+");


   char buffer[BUF_SIZE];
   strcpy(buffer, str);

   string email = buffer;

   // try to match the string with the regular expression
   return regex_match(email, pattern);
}

Napi::Value emailChecker(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if(info.Length() < 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
        return env.Null();
    }

    string email = info[0].As<Napi::String>().Utf8Value();

    Napi::Boolean check = Napi::Boolean::New(env, checkEmail(email.c_str()));
    return check;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "email"), Napi::Function::New(env, emailChecker));
  return exports;
}

NODE_API_MODULE(email, Init)