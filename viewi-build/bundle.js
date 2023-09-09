/*!
 * Viewi
 * (c) 2020-now Ivan Voitovych
 * Released under the MIT License.
 */
function json_encode (mixedVal) { 
  var $global = (typeof window !== 'undefined' ? window : global)
  $global.$locutus = $global.$locutus || {}
  var $locutus = $global.$locutus
  $locutus.php = $locutus.php || {}
  var json = $global.JSON
  var retVal
  try {
    if (typeof json === 'object' && typeof json.stringify === 'function') {
      retVal = json.stringify(mixedVal)
      if (retVal === undefined) {
        throw new SyntaxError('json_encode')
      }
      return retVal
    }
    var value = mixedVal
    var quote = function (string) {
      var escapeChars = [
        '\u0000-\u001f',
        '\u007f-\u009f',
        '\u00ad',
        '\u0600-\u0604',
        '\u070f',
        '\u17b4',
        '\u17b5',
        '\u200c-\u200f',
        '\u2028-\u202f',
        '\u2060-\u206f',
        '\ufeff',
        '\ufff0-\uffff'
      ].join('')
      var escapable = new RegExp('[\\"' + escapeChars + ']', 'g')
      var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
      }
      escapable.lastIndex = 0
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a]
        return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0)
          .toString(16))
          .slice(-4)
      }) + '"' : '"' + string + '"'
    }
    var _str = function (key, holder) {
      var gap = ''
      var indent = '    '
      var i = 0
      var k = ''
      var v = ''
      var length = 0
      var mind = gap
      var partial = []
      var value = holder[key]
      if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
        value = value.toJSON(key)
      }
      switch (typeof value) {
        case 'string':
          return quote(value)
        case 'number':
          return isFinite(value) ? String(value) : 'null'
        case 'boolean':
          return String(value)
        case 'object':
          if (!value) {
            return 'null'
          }
          gap += indent
          partial = []
          if (Object.prototype.toString.apply(value) === '[object Array]') {
            length = value.length
            for (i = 0; i < length; i += 1) {
              partial[i] = _str(i, value) || 'null'
            }
            v = partial.length === 0 ? '[]' : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']'
            return v
          }
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = _str(k, value)
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v)
              }
            }
          }
          v = partial.length === 0 ? '{}' : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}'
          return v
        case 'undefined':
        case 'function':
        default:
          throw new SyntaxError('json_encode')
      }
    }
    return _str('', {
      '': value
    })
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      throw new Error('Unexpected error type in json_encode()')
    }
    $locutus.php.last_error_json = 4
    return null
  }
}


function implode (glue, pieces) {
  var i = ''
  var retVal = ''
  var tGlue = ''
  if (arguments.length === 1) {
    pieces = glue
    glue = ''
  }
  if (typeof pieces === 'object') {
    if (Object.prototype.toString.call(pieces) === '[object Array]') {
      return pieces.join(glue)
    }
    for (i in pieces) {
      retVal += tGlue + pieces[i]
      tGlue = glue
    }
    return retVal
  }
  return pieces
}


function date (format, timestamp) {
  var jsdate, f
  var txtWords = [
    'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  var formatChr = /\\?(.?)/gi
  var formatChrCb = function (t, s) {
    return f[t] ? f[t]() : s
  }
  var _pad = function (n, c) {
    n = String(n)
    while (n.length < c) {
      n = '0' + n
    }
    return n
  }
  f = {
    d: function () {
      return _pad(f.j(), 2)
    },
    D: function () {
      return f.l()
        .slice(0, 3)
    },
    j: function () {
      return jsdate.getDate()
    },
    l: function () {
      return txtWords[f.w()] + 'day'
    },
    N: function () {
      return f.w() || 7
    },
    S: function () {
      var j = f.j()
      var i = j % 10
      if (i <= 3 && parseInt((j % 100) / 10, 10) === 1) {
        i = 0
      }
      return ['st', 'nd', 'rd'][i - 1] || 'th'
    },
    w: function () {
      return jsdate.getDay()
    },
    z: function () {
      var a = new Date(f.Y(), f.n() - 1, f.j())
      var b = new Date(f.Y(), 0, 1)
      return Math.round((a - b) / 864e5)
    },
    W: function () {
      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3)
      var b = new Date(a.getFullYear(), 0, 4)
      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2)
    },
    F: function () {
      return txtWords[6 + f.n()]
    },
    m: function () {
      return _pad(f.n(), 2)
    },
    M: function () {
      return f.F()
        .slice(0, 3)
    },
    n: function () {
      return jsdate.getMonth() + 1
    },
    t: function () {
      return (new Date(f.Y(), f.n(), 0))
        .getDate()
    },
    L: function () {
      var j = f.Y()
      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0
    },
    o: function () {
      var n = f.n()
      var W = f.W()
      var Y = f.Y()
      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0)
    },
    Y: function () {
      return jsdate.getFullYear()
    },
    y: function () {
      return f.Y()
        .toString()
        .slice(-2)
    },
    a: function () {
      return jsdate.getHours() > 11 ? 'pm' : 'am'
    },
    A: function () {
      return f.a()
        .toUpperCase()
    },
    B: function () {
      var H = jsdate.getUTCHours() * 36e2
      var i = jsdate.getUTCMinutes() * 60
      var s = jsdate.getUTCSeconds()
      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3)
    },
    g: function () {
      return f.G() % 12 || 12
    },
    G: function () {
      return jsdate.getHours()
    },
    h: function () {
      return _pad(f.g(), 2)
    },
    H: function () {
      return _pad(f.G(), 2)
    },
    i: function () {
      return _pad(jsdate.getMinutes(), 2)
    },
    s: function () {
      return _pad(jsdate.getSeconds(), 2)
    },
    u: function () {
      return _pad(jsdate.getMilliseconds() * 1000, 6)
    },
    e: function () {
      var msg = 'Not supported (see source code of date() for timezone on how to add support)'
      throw new Error(msg)
    },
    I: function () {
      var a = new Date(f.Y(), 0)
      var c = Date.UTC(f.Y(), 0)
      var b = new Date(f.Y(), 6)
      var d = Date.UTC(f.Y(), 6)
      return ((a - c) !== (b - d)) ? 1 : 0
    },
    O: function () {
      var tzo = jsdate.getTimezoneOffset()
      var a = Math.abs(tzo)
      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4)
    },
    P: function () {
      var O = f.O()
      return (O.substr(0, 3) + ':' + O.substr(3, 2))
    },
    T: function () {
      return 'UTC'
    },
    Z: function () {
      return -jsdate.getTimezoneOffset() * 60
    },
    c: function () {
      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb)
    },
    r: function () {
      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb)
    },
    U: function () {
      return jsdate / 1000 | 0
    }
  }
  var _date = function (format, timestamp) {
    jsdate = (timestamp === undefined ? new Date() 
      : (timestamp instanceof Date) ? new Date(timestamp) 
      : new Date(timestamp * 1000) 
    )
    return format.replace(formatChr, formatChrCb)
  }
  return _date(format, timestamp)
}


function json_decode (strJson) { 
  var $global = (typeof window !== 'undefined' ? window : global)
  $global.$locutus = $global.$locutus || {}
  var $locutus = $global.$locutus
  $locutus.php = $locutus.php || {}
  var json = $global.JSON
  if (typeof json === 'object' && typeof json.parse === 'function') {
    try {
      return json.parse(strJson)
    } catch (err) {
      if (!(err instanceof SyntaxError)) {
        throw new Error('Unexpected error type in json_decode()')
      }
      $locutus.php.last_error_json = 4
      return null
    }
  }
  var chars = [
    '\u0000',
    '\u00ad',
    '\u0600-\u0604',
    '\u070f',
    '\u17b4',
    '\u17b5',
    '\u200c-\u200f',
    '\u2028-\u202f',
    '\u2060-\u206f',
    '\ufeff',
    '\ufff0-\uffff'
  ].join('')
  var cx = new RegExp('[' + chars + ']', 'g')
  var j
  var text = strJson
  cx.lastIndex = 0
  if (cx.test(text)) {
    text = text.replace(cx, function (a) {
      return '\\u' + ('0000' + a.charCodeAt(0)
        .toString(16))
        .slice(-4)
    })
  }
  var m = (/^[\],:{}\s]*$/)
    .test(text.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, ']')
    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
  if (m) {
    j = eval('(' + text + ')') 
    return j
  }
  $locutus.php.last_error_json = 4
  return null
}


var viewiBundleEntry = function (exports, bring) {
    var $base = bring('$base');
    var notify = bring('notify');
exports.AsyncStateManager = function () { };

var OnReady = bring('OnReady');
var ajax = bring('ajax');

var HttpClient = function () {
    this.response = null;
    this.interceptors = [];
    this.options = {};
    var $this = this;
    var isObject = function (variable) {
        return typeof variable === 'object' &&
            !Array.isArray(variable) &&
            variable !== null
    };

    this.request = function (type, url, data, options) {
        if (typeof data === 'undefined') {
            data = null;
        }
        this.setOptions(options);
        if (typeof viewiScopeData !== 'undefined') {
            var requestKey = type.toLowerCase() + '_' + url + '_' + JSON.stringify(data);
            if (requestKey in viewiScopeData) {
                return new OnReady(function (onOk, onError) {
                    onOk(viewiScopeData[requestKey]);
                    delete viewiScopeData[requestKey];
                });
            }
        }
        var resolver = ajax.request(type, url, data, this.options);
        if (this.interceptors.length > 0) {
            var nextHandler = null;
            var handler = null;
            var lastHandler = null;
            var finalResolve = null;
            var finalReject = null;
            var response = {
                success: false,
                content: null,
                canceled: false,
                headers: {},
                status: 0
            };
            var makeRequest = function (after) {
                // console.log('==Request==');
                lastHandler.after = after;
                resolver.then(function (data) {
                    response.success = true;
                    response.content = data;
                    after(lastHandler.next);
                }, function (error) {
                    response.content = error;
                    after(lastHandler.next);
                });
            };
            // var handlers = [];
            for (var i = this.interceptors.length - 1; i >= 0; i--) {
                var interceptor = this.interceptors[i];
                var entryCall = interceptor[0][interceptor[1]];

                handler = {
                    response: response,
                    handle: makeRequest,
                    onHandle: entryCall,
                    httpClient: $this,
                    reject: finalReject,
                    after: function () {
                        // console.log('empty after');
                    },
                    next: function () {
                        // console.log('next called', this);
                        if (this.previousHandler) {
                            this.previousHandler.after(this.previousHandler.next);
                        } else {
                            // this.after(function () {
                            // console.log('--Resolving data--');
                            if (response.success) {
                                finalResolve(response.content);
                            } else {
                                finalReject(response.content);
                            }
                            // });
                        }
                        // call nextHandler.after(nextHandler.next);
                    }
                };
                if (!lastHandler) {
                    lastHandler = handler;
                }
                // handlers.unshift(handler);
                handler.next = handler.next.bind(handler);
                if (nextHandler) {
                    handler.nextHandler = nextHandler;
                    // (function (nextHandler, handler) {
                    //     nextHandler.handle = handler.onHandle
                    // })(nextHandler, handler);  
                    nextHandler.previousHandler = handler;
                    handler.handle = (function (nextHandler) {
                        return function (after) {
                            nextHandler.previousHandler.after = after;
                            nextHandler.reject = nextHandler.previousHandler.reject;
                            nextHandler.onHandle(nextHandler);
                            // console.log('after', nextHandler);
                        };
                    })(nextHandler);
                }
                nextHandler = handler;
            }
            // console.log(handlers);

            return new OnReady(function (resolve, reject) {
                finalResolve = resolve;
                finalReject = reject;
                handler.reject = reject;
                handler.onHandle(handler);
            });
            // OLD
            // for (var i = this.interceptors.length - 1; i >= 0; i--) {
            //     var httpMiddleWare = this.interceptors[i];
            //     var nextAction = resolver.action;
            //     resolver = (function (nextAction) {
            //         return new OnReady(function (onOk, onError) {
            //             httpMiddleWare[0][httpMiddleWare[1]]($this,
            //                 // next
            //                 function () {
            //                     nextAction(onOk, onError);
            //                 },
            //                 // onError
            //                 onError
            //             );
            //         })
            //     })(nextAction);
            // }
        }
        return resolver;
    };

    this.get = function (url, options) {
        var resolver = $this.request('GET', url, null, options);
        return resolver;
    };

    this.post = function (url, data, options) {
        var resolver = $this.request('POST', url, data, options);
        return resolver;
    };

    this.put = function (url, data, options) {
        var resolver = $this.request('PUT', url, data, options);
        return resolver;
    };

    this.delete = function (url, data, options) {
        var resolver = $this.request('DELETE', url, data, options);
        return resolver;
    };

    this.with = function (interceptor) {
        var client = new HttpClient();
        client.interceptors = this.interceptors.slice();
        client.interceptors.push(interceptor);
        client.options = Object.assign({}, this.options); // TODO: deep clone
        for (var k in client.options) {
            if (isObject(client.options[k])) {
                client.options[k] = Object.assign({}, client.options[k]);
            }
        }
        return client;
    }

    this.setOptions = function (options) {
        for (var k in options) {
            if (k === 'headers') {
                this.options[k] = Object.assign(this.options[k] || {}, options[k]);
            } else {
                this.options[k] = options[k];
            }
        }
    }
};
exports.HttpClient = HttpClient;

/**
 * @var Viewi app
 */
var app = bring('viewiApp');
var ClientRouter = function () {
    this.navigateBack = function () {
        history.back();
    };

    this.navigate = function (url) {
        /**
         * @var Viewi app
         */
        app.go(url, true);
    }

    this.getUrl = function () {
        return location.pathname;
    }
};
exports.ClientRouter = ClientRouter;


var CounterState = function () {
    var $this = this;
    this.count = 0;
    
    this.increment = function () {
        $this.count++;
    };

    this.decrement = function () {
        $this.count--;
    };
};

    exports.CounterState = CounterState;

var ForgotPasswordPage = function () {
    var $this = this;
    $base(this);
    this.title = "Reset Password";
    var http = null;
    var router = null;
    this.counter = null;

    this.__init = function (_http, clientRouter, counterState) {
        http = _http;
        router = clientRouter;
        $this.counter = counterState;
    };

    this.save = function (event) {
        event.preventDefault();
        // kanton404@gmail.com
        http.get("/api/name") .then(function (data) {
            console.log(data);
            // if (!$this->Id) {
            router.navigate("/sources/edit/" + data.name);
            // }
        },function (error) {
            console.log(error);
        });
    };
};

    exports.ForgotPasswordPage = ForgotPasswordPage;

var InputState = function () {
    var $this = this;
    this.states = {
        n: 2,
        label: {
            default: 'text-gray-900 dark:text-white',
            error: 'text-red-700 dark:text-red-500',
            success: 'text-green-700 dark:text-green-500'
        } ,
        input: {
            default: 'bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white',
            error: 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-red-100 dark:border-red-400',
            success: 'bg-green-50 border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500 dark:bg-green-100 dark:border-green-400'
        } 
    } ;
};

    exports.InputState = InputState;

var DomHelper = function () {
    var $this = this;
    

};

DomHelper.getDocument = function () {
    
        return document;;
    // nothing on server-side
    return null;
};


DomHelper.getWindow = function () {
    
        return window;;
    // nothing on server-side
    return null;
};


    exports.DomHelper = DomHelper;

var SignInPage = function () {
    var $this = this;
    $base(this);
    this.title = "Signin to MyshopOS";
    this.email = '';
    this.password = '';
    this.resp = '';
    this.isSubmitted = null;
    this.validEmail = null;
    this.inputStates = null;
    var http = null;
    var router = null;
    // function __init(HttpClient $http, ClientRouter $clientRouter, UIClass $uiClassState){

    this.__init = function (_http, clientRouter, inputState) {
        http = _http;
        router = clientRouter;
        // $this->uiClass = $uiClassState;
        $this.inputStates = inputState;
    };

    this.login = function (event) {
        event.preventDefault();
        var document = DomHelper.getWindow();
        // echo $email->value . ' ' . $password->value;
        http.post('/api/login',{ email: $this.email, password: $this.password } ) .then(function (resp) {
            console.log("Resp: " + json_encode(resp,true));
            // $this->isSubmitted = 'true';
            $this.validEmail = resp.email;
            $this.validPassword = resp.password;
            // $this->isValid = ['email' => $resp->email, 'password' => $resp->password];
            console.log($this.validEmail);
            // echo count($this->valid);
            // $this->resp = $resp;
            // if (!$this->Id) {
            // $this->router->navigate("/sources/edit/{$data->name}");
            // }
        },function (error) {
            console.log(error);
        });
        // kanton404@gmail.com
    };

    this.valid = function (field) {
        return field;
    };
};

    exports.SignInPage = SignInPage;

var StaticDataService = function (_http, _router) {
    var $this = this;
    var http = null;
    var router = null;

    this.__construct = function (_http, _router) {
        http = _http;
        router = _router;
    };

    this.GetCountries = function (callback) {
        http.get('/viewi-app/assets/static/data/countries.json') .then(function (data) {
            // echo $data;
            callback(data);
        },function (error) {
            console.log(error);
        });
    };

    this.__construct.apply(this, arguments);
};

    exports.StaticDataService = StaticDataService;

// namespace Components\Db\conn;
// require "/viewi-app/Components/Services/db/conn.php";
var SignUpPage = function () {
    var $this = this;
    $base(this);
    this.title = "Create a MyshopOS account";
    this.staticDataService = null;
    this.staticData = null;
    var http = null;
    var router = null;

    this.__init = function (_http, _router, staticDataService) {
        http = _http;
        router = _router;
        $this.staticDataService = staticDataService;
        $this.ReadCountries();
    };

    this.__rendered = function () {
        // click outside
        // $document = DomHelper::getDocument();
        // if ($document !== null) {
        //     $document->addEventListener('click', $this->onClickOutside, 'hello');
        // }
        // // resize event
        // // $document = DomHelper::getWindow();
        // if ($document !== null) {
        //     $document->addEventListener('resize', $this->onResize, ['passive' => true]);
        // }
        // echo DomHelper::getDocument()->location;
        // $this->http->get('/viewi-app/assets/static/data/countries.json')
        // ->then(function($data){
        //     echo $data;
        //     // $this->countries = json_decode(json_encode($data));
        //     $this->countries = ($data);
        // }, function($error){
        //     echo $error;
        // });
    };

    this.ReadCountries = function () {
        $this.staticDataService.GetCountries(function (staticData) {
            console.log(staticData);
            $this.staticData = staticData;
        });
    };

    this.handleSignUp = function (event) {
        event.preventDefault();
    };
};

    exports.SignUpPage = SignUpPage;

var AppBar = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.AppBar = AppBar;

var AppUpdateBanner = function () {
    var $this = this;
    $base(this);
};

    exports.AppUpdateBanner = AppUpdateBanner;

var CookieNoticeBanner = function () {
    var $this = this;
    $base(this);
};

    exports.CookieNoticeBanner = CookieNoticeBanner;

var MobileApp = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.MobileApp = MobileApp;

var Footer = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.Footer = Footer;

var Hero = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.Hero = Hero;

var Features = function () {
    var $this = this;
    this.features = [
        {
            link: "features/invoicing",
            icon: "ticket-alt",
            title: "Invoicing",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/estimates",
            icon: "calculator",
            title: "Estimates",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/sales-orders",
            icon: "cart-full",
            title: "Sales Orders",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/purchase-orders",
            icon: "shopping-basket",
            title: "Purchase Orders",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/bills",
            icon: "wallet",
            title: "Bills",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/inventory",
            icon: "tag",
            title: "Inventory",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/expenses",
            icon: "notepad",
            title: "Expenses",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/taxation",
            icon: "remove-file",
            title: "Tax",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/reporting",
            icon: "graph",
            title: "Reporting",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/online-payments",
            icon: "cloud",
            title: "Online Payments",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/user-rights",
            icon: "lock",
            title: "User Rights",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/customer-portal",
            icon: "network",
            title: "Customer Portal",
            text: "Create invoices of the products or services you offer and get paid faster."
        } ,
        {
            link: "features/vendor-portal",
            icon: "home",
            title: "Vendor Portal",
            text: "Create invoices of the products or services you offer and get paid faster."
        } 
    ] ;
};

    exports.Features = Features;

var NavBar = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    this.currentUrl = '';
    this.features = null;

    this.__init = function (features) {
        $this.features = features;
    };
};

    exports.NavBar = NavBar;

// use Application\Components\Services\Demo\CounterState;
var SideBar = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.SideBar = SideBar;

// use Application\Components\Services\Demo\CounterState;
var Testimonial = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};

    exports.Testimonial = Testimonial;

var WhyUs = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
};


this.getFeatures = function () {
    console.log($this.features);
    return $this.features;
};
    exports.WhyUs = WhyUs;

var ContactPage = function () {
    var $this = this;
    $base(this);
    this.title = 'Contact | KOG';
    this.statusMessage = "loading...";
    this.data = "";
    var http = null;

    this.__init = function (_http) {
        http = _http;
    };

    this.pop = function () {
        // $this->http->get("https://jsonplaceholder.typicode.com/todos")
        http.get("/api/name") .then(function (resp) {
            // use $data here
            $this.statusMessage = 'We have received Your message and we will get to you shortly';
            $this.data = resp['name'] ;
        },function (error) {
            // handle error here
            $this.statusMessage = 'Something went wrong';
        });
    };
};

    exports.ContactPage = ContactPage;

var Counter = function () {
    var $this = this;
    $base(this);
    this.count = 0;
    
    this.increment = function () {
        $this.count++;
    };

    this.decrement = function () {
        $this.count--;
    };
};

    exports.Counter = Counter;

var FeaturesPage = function () {
    var $this = this;
    $base(this);
    this.title = 'Features';
    this.features = null;

    this.__init = function (features) {
        $this.features = features;
    };
};

    exports.FeaturesPage = FeaturesPage;

var HardwarePage = function () {
    var $this = this;
    $base(this);
    this.title = 'Hardware';
    this.activeIndex = 0;
    this.activeClass = "border-blue-600 bg-white hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:bg-gray-900 dark:focus:ring-blue-800";
    this.inactiveClass = "border-white hover:border-gray-200 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:ring-4 focus:outline-none focus:ring-gray-300 dark:text-white dark:focus:ring-gray-800";
    this.active = '';

    this.__init = function () {
        $this.active = $this.activeIndex == 0 ? $this.activeClass:$this.inactiveClass;
    };

    this.toggleCategoryIndex = function (event, index) {
        // echo $index;
        $this.activeIndex = index;
        $this.active = $this.activeIndex == index ? $this.activeClass:$this.inactiveClass;
        return $this.active;
    };

    this.handleSubmit = function (event) {
        event.preventDefault();
    };
};

    exports.HardwarePage = HardwarePage;

// use Viewi\Common\ClientRouter;
var HomePage = function () {
    var $this = this;
    $base(this);
    this.title = 'Smart Billing Software';
    // public string $currentUrl = '';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";
    // public array $posts = [
    //     'Viewi is awesome!',
    //     'Lorem ipsum dolor sit amet'
    // ];
    // private ClientRouter $clientRouter;
    // function __init(ClientRouter $clientRouter) {
    //     $this->clientRouter = $clientRouter;
    // }

    this.__mounted = function () {
        // $currentUrl = $this->clientRouter->getUrl();
        // $this->clientRouter->navigate("/signin");
        // $isActive = $myurl == $currentUrl;
    };

    this.handleSubmit = function (event) {
        event.preventDefault();
    };
};

    exports.HomePage = HomePage;

var BaseLayout = function () {
    var $this = this;
    $base(this);
    this.title = 'Viewi';
};

    exports.BaseLayout = BaseLayout;

var PublicLayout = function () {
    var $this = this;
    $base(this);
    this.title = '';
    // function __construct(ClientRouter $clientRouter)
    // {
    //     $this->clientRouter = $clientRouter;
    // }
    // function __mounted() {
    //     $currentUrl = $this->clientRouter->getUrl();
    //     // $isActive = $myurl === $currentUrl;
    // }
};

    exports.PublicLayout = PublicLayout;

var NotFoundPage = function () {
    var $this = this;
    $base(this);
    this.title = "Page Not Found";
};

    exports.NotFoundPage = NotFoundPage;

var Post = function () {
    var $this = this;
    $base(this);
    this.content = null;
};

    exports.Post = Post;

var PricingPage = function () {
    var $this = this;
    $base(this);
    this.title = 'Pricing';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";
    this.currentUrl = '';
    this.isActive = '';
    this.myurl = null;
    var clientRouter = null;

    this.__init = function (_clientRouter) {
        clientRouter = _clientRouter;
    };

    this.__mounted = function () {
        var currentUrl_0 = clientRouter.getUrl();
        // $isActive = $myurl == $currentUrl;
    };

    this.handleSubmit = function (event) {
        event.preventDefault();
    };
};

    exports.PricingPage = PricingPage;

var ServicesPage = function () {
    var $this = this;
    $base(this);
    this.title = 'Services';
    // public array $fruits = ["Orange", "Apple"];
    // public string $name = "Your name";
    
    this.handleSubmit = function (event) {
        event.preventDefault();
    };
};

    exports.ServicesPage = ServicesPage;

var CssBundle = function () {
    var $this = this;
    $base(this);
    this.links = [];
    this.link = '';
    this.minify = false;
    this.combine = false;
    this.inline = false;
    this.shakeTree = false;
    
    this.__version = function () {
        var key = implode('|',$this.links);
        key += $this.link;
        key += $this.minify ? '1':'0';
        key += $this.inline ? '1':'0';
        key += $this.shakeTree ? '1':'0';
        key += $this.combine ? '1':'0';
        return key;
    };
};

    exports.CssBundle = CssBundle;

var ViewiScripts = function (httpClient, _asyncStateManager) {
    var $this = this;
    $base(this);
    var http = null;
    var asyncStateManager = null;
    this.responses = '{}';
    
    this.__construct = function (httpClient, _asyncStateManager) {
        http = httpClient;
        asyncStateManager = _asyncStateManager;
        
        return; // data scripts only for backend;
        var subscription = asyncStateManager.subscribe('httpReady');
        subscription.then(function () {
            $this.responses = json_encode(http.getScopeResponses());
        });
    };

    this.getDataScript = function () {
        
        return '<script>/** BLANK */</script>'; // data scripts only for backend;
        return "<script>window.viewiScopeData = " + $this.responses + ";</script>";
    };

    this.__construct.apply(this, arguments);
};

    exports.ViewiScripts = ViewiScripts;

};