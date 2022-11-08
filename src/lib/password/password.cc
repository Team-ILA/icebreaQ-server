#include <napi.h>

#include <iostream>
#include <cstring>
#include <string>

#define BUF_SIZE 50

using namespace std; 
  
bool checkPassword(const char *str) 
{ 
    char buffer[BUF_SIZE];
    strcpy(buffer, str);
    
    string password = buffer;
    int n = password.length();
    if(n < 11) return false;
    bool hasLower = false, hasUpper = false, hasDigit = false, hasSpecial = false;
  
    for(int i = 0; i < n; i++)
    { 
        if(islower(password[i])) 
            hasLower = true; 
        else if(isupper(password[i])) 
            hasUpper = true; 
        else if(isdigit(password[i])) 
            hasDigit = true; 
        else
            hasSpecial = true;
    }

    if(hasLower && hasUpper && hasDigit && hasSpecial)
        return true;
    else
        return false;

} 

Napi::Value passwordChecker(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if(info.Length() < 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
        return env.Null();
    }

    string password = info[0].As<Napi::String>().Utf8Value();

    Napi::Boolean check = Napi::Boolean::New(env, checkPassword(password.c_str()));
    return check;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "password"), Napi::Function::New(env, passwordChecker));
  return exports;
}

NODE_API_MODULE(password, Init)