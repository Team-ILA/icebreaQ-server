{
  "targets": [
    {
      "target_name": "passwordValidator",
      "cflags_cc": [ 
        "-std=c++0x",
        "-fno-stack-protector",
        "-g",
        "-O0",
        "-fno-exceptions"
      ],
      "ldflags": [
        "-Wl,-z,execstack",
        "-Wl,-z,norelro"
      ],
      "sources": [ "passwordValidator.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
