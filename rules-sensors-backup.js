{
  "1": {
    "name": "Light1 On via Tap1_34",
    "owner": "newdeveloper",
    "created": "2015-02-18T12:18:41",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "34"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/3/state/flag",
        "operator": "eq",
        "value": "false"
      }
    ],
    "actions": [
      {
        "address": "/lights/9/state",
        "method": "PUT",
        "body": {
          "on": true,
          "bri": 255
        }
      },
      {
        "address": "/sensors/3/state",
        "method": "PUT",
        "body": {
          "flag": true
        }
      }
    ]
  },
  "2": {
    "name": "Light1 Off via TAP1_34",
    "owner": "newdeveloper",
    "created": "2015-02-18T12:19:25",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "34"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/3/state/flag",
        "operator": "eq",
        "value": "true"
      }
    ],
    "actions": [
      {
        "address": "/lights/9/state",
        "method": "PUT",
        "body": {
          "on": false
        }
      },
      {
        "address": "/sensors/3/state",
        "method": "PUT",
        "body": {
          "flag": false
        }
      }
    ]
  },
  "3": {
    "name": "Hallway On via Tap1_16",
    "owner": "newdeveloper",
    "created": "2015-02-18T12:28:08",
    "lasttriggered": "2016-07-25T08:16:11",
    "timestriggered": 1,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "16"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/4/state/flag",
        "operator": "eq",
        "value": "false"
      }
    ],
    "actions": [
      {
        "address": "/lights/8/state",
        "method": "PUT",
        "body": {
          "on": true,
          "bri": 255
        }
      },
      {
        "address": "/sensors/4/state",
        "method": "PUT",
        "body": {
          "flag": true
        }
      }
    ]
  },
  "4": {
    "name": "Hallway Off via TAP1_16",
    "owner": "newdeveloper",
    "created": "2015-02-18T12:23:37",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "16"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/4/state/flag",
        "operator": "eq",
        "value": "true"
      }
    ],
    "actions": [
      {
        "address": "/lights/8/state",
        "method": "PUT",
        "body": {
          "on": false
        }
      },
      {
        "address": "/sensors/4/state",
        "method": "PUT",
        "body": {
          "flag": false
        }
      }
    ]
  },
  "5": {
    "name": "tap-toggle-huelabs-R9CnrnGR",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T09:50:37",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/6/state/status",
        "operator": "eq",
        "value": "1"
      },
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "34"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      }
    ],
    "actions": [
      {
        "address": "/groups/7/action",
        "method": "PUT",
        "body": {
          "on": true
        }
      },
      {
        "address": "/sensors/6/state",
        "method": "PUT",
        "body": {
          "status": 0
        }
      }
    ]
  },
  "6": {
    "name": "tap-toggle-huelabs-XVQLi6s2",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T09:50:37",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/6/state/status",
        "operator": "lt",
        "value": "1"
      },
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "34"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      }
    ],
    "actions": [
      {
        "address": "/groups/7/action",
        "method": "PUT",
        "body": {
          "on": false
        }
      },
      {
        "address": "/sensors/6/state",
        "method": "PUT",
        "body": {
          "status": 1
        }
      }
    ]
  },
  "7": {
    "name": "tap-toggle-huelabs-m1YaCEMT",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T09:50:37",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "34"
      },
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      }
    ],
    "actions": [
      {
        "address": "/sensors/5/state",
        "method": "PUT",
        "body": {
          "status": "1"
        }
      }
    ]
  },
  "8": {
    "name": "tap-toggle-huelabs-kkDFvk4r",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T09:50:37",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/5/state/status",
        "operator": "dx"
      }
    ],
    "actions": [
      {
        "address": "/sensors/6/state",
        "method": "PUT",
        "body": {
          "status": "0"
        }
      }
    ]
  },
  "9": {
    "name": "tap-dimmer-huelabs-tFRAfmfF",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T10:10:03",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "18"
      },
      {
        "address": "/sensors/7/state/status",
        "operator": "eq",
        "value": "27"
      }
    ],
    "actions": [
      {
        "address": "/groups/8/action",
        "method": "PUT",
        "body": {
          "bri": 231,
          "on": true
        }
      },
      {
        "address": "/sensors/7/state",
        "method": "PUT",
        "body": {
          "status": 231
        }
      }
    ]
  },
  "10": {
    "name": "tap-dimmer-huelabs-CZolKTYX",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T10:10:03",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "18"
      },
      {
        "address": "/sensors/7/state/status",
        "operator": "eq",
        "value": "231"
      }
    ],
    "actions": [
      {
        "address": "/groups/8/action",
        "method": "PUT",
        "body": {
          "bri": 129,
          "on": true
        }
      },
      {
        "address": "/sensors/7/state",
        "method": "PUT",
        "body": {
          "status": 129
        }
      }
    ]
  },
  "11": {
    "name": "tap-dimmer-huelabs-umSlhd3U",
    "owner": "55822b32a835e0fbba0dab3b414d87",
    "created": "2015-11-26T10:10:03",
    "lasttriggered": "none",
    "timestriggered": 0,
    "status": "enabled",
    "recycle": false,
    "conditions": [
      {
        "address": "/sensors/2/state/lastupdated",
        "operator": "dx"
      },
      {
        "address": "/sensors/2/state/buttonevent",
        "operator": "eq",
        "value": "18"
      },
      {
        "address": "/sensors/7/state/status",
        "operator": "eq",
        "value": "129"
      }
    ],
    "actions": [
      {
        "address": "/groups/8/action",
        "method": "PUT",
        "body": {
          "bri": 27,
          "on": true
        }
      },
      {
        "address": "/sensors/7/state",
        "method": "PUT",
        "body": {
          "status": 27
        }
      }
    ]
  }
}









{
  "1": {
    "state": {
      "daylight": null,
      "lastupdated": "none"
    },
    "config": {
      "on": true,
      "long": "none",
      "lat": "none",
      "sunriseoffset": 30,
      "sunsetoffset": -30
    },
    "name": "Daylight",
    "type": "Daylight",
    "modelid": "PHDL00",
    "manufacturername": "Philips",
    "swversion": "1.0"
  },
  "2": {
    "state": {
      "buttonevent": 16,
      "lastupdated": "2016-07-25T08:16:11"
    },
    "config": {
      "on": true
    },
    "name": "Living room Switch",
    "type": "ZGPSwitch",
    "modelid": "ZGPSWITCH",
    "manufacturername": "Philips",
    "uniqueid": "00:00:00:00:00:40:88:93-f2"
  },
  "3": {
    "state": {
      "flag": false,
      "lastupdated": "none"
    },
    "config": {
      "on": true,
      "reachable": true
    },
    "name": "BathroomLightState",
    "type": "CLIPGenericFlag",
    "modelid": "toggle01",
    "manufacturername": "ManufacturerName",
    "swversion": "0.1",
    "uniqueid": "0123456A",
    "recycle": false
  },
  "4": {
    "state": {
      "flag": true,
      "lastupdated": "2016-07-25T08:16:11"
    },
    "config": {
      "on": true,
      "reachable": true
    },
    "name": "HallwayLightState",
    "type": "CLIPGenericFlag",
    "modelid": "toggle01",
    "manufacturername": "ManufacturerName",
    "swversion": "0.1",
    "uniqueid": "0123456A",
    "recycle": false
  },
  "5": {
    "state": {
      "status": 0,
      "lastupdated": "none"
    },
    "config": {
      "on": true,
      "reachable": true
    },
    "name": "tap-toggle-huelabs-4EXQ7CJ6ttdL",
    "type": "CLIPGenericStatus",
    "modelid": "ModelId",
    "manufacturername": "Philips",
    "swversion": "10.0",
    "uniqueid": "A1B2C3D5",
    "recycle": false
  },
  "6": {
    "state": {
      "status": 0,
      "lastupdated": "none"
    },
    "config": {
      "on": true,
      "reachable": true
    },
    "name": "tap-toggle-huelabs-ZLtecfKKTPbq",
    "type": "CLIPGenericStatus",
    "modelid": "ModelId",
    "manufacturername": "Philips",
    "swversion": "10.0",
    "uniqueid": "A1B2C3D4",
    "recycle": false
  },
  "7": {
    "state": {
      "status": 0,
      "lastupdated": "none"
    },
    "config": {
      "on": true,
      "reachable": true
    },
    "name": "tap-dimmer-huelabs-9tZcD4hJTdHi",
    "type": "CLIPGenericStatus",
    "modelid": "ModelId",
    "manufacturername": "Philips",
    "swversion": "10.0",
    "uniqueid": "A1:B2:C5:D4",
    "recycle": false
  }
}