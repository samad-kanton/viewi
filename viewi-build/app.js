/*!
 * Viewi
 * (c) 2020-now Ivan Voitovych
 * Released under the MIT License.
 */

var viewiGlobal = window;
function _lock(obj, property, value) {
    Object.defineProperty(obj, property, {
        value: value,
        writable: false,
        configurable: false
    });
}
_lock(viewiGlobal, 'viewiModules', {});
_lock(viewiGlobal.viewiModules, 'exports', {});
_lock(viewiGlobal.viewiModules, 'bring', function (name) {
    var thing = viewiGlobal.viewiModules.exports[name];
    if (!thing) throw new Error('Can not find module: ' + name);
    return thing;
});

var viewiExports = viewiGlobal.viewiModules.exports;
var viewiBring = viewiGlobal.viewiModules.bring;

// How to use:
// (function (exports, bring) {
//     // var log = bring('log'); // import

//     // exports.build = build; // export
// })(viewiExports, viewiBring);
(function (exports, bring) {
    var RouteItem = function (method, url, action, wheres) {
        this.method = method;
        this.url = url;
        this.action = action;
        this.wheres = {};
        if (wheres) {
            this.wheres = wheres;
        }
        this.where = function (wheresOrName, expr) {
            if (wheresOrName !== null && typeof wheresOrName === 'object') {
                this.wheres = Object.assign(this.where, wheresOrName);
            } else if (expr) {
                this.wheres[wheresOrName] = expr;
            }
            return this;
        };
    }

    var Router = function () {
        var routes = [];
        var trimExpr = /^\/|\/$/g;
        this.setRoutes = function (routeList) {
            routes = routeList;
        };

        this.register = function (method, url, action) {
            var item = new RouteItem(
                method.toLowerCase(),
                url,
                action
            );
            routes.push(item);
            return item;
        };

        this.get = function (url, action) {
            return this.register('get', url, action);
        };

        this.resolve = function (url) {
            url = url.replace(trimExpr, '');
            var parts = url.split('/');
            for (var k in routes) {
                var params = {};
                var valid = true;
                var item = routes[k];
                var targetUrl = item.url.replace(trimExpr, '');
                var targetParts = targetUrl.split('/');
                var pi = 0;
                var skipAll = false;
                for (pi; pi < targetParts.length; pi++) {
                    var urlExpr = targetParts[pi];
                    var hasWildCard = urlExpr.indexOf('*') !== -1;
                    if (hasWildCard) {
                        var beginning = urlExpr.slice(0, -1);
                        if (!beginning || parts[pi].indexOf(beginning) === 0) {
                            skipAll = true;
                            break;
                        }
                    }
                    var hasParams = urlExpr.indexOf('{') !== -1;
                    if (
                        urlExpr !== parts[pi] && !hasParams
                    ) {
                        valid = false;
                        break;
                    }
                    if (hasParams) {
                        // has {***} parameter
                        var bracketParts = urlExpr.split(/[{}]+/);
                        // console.log(urlExpr, bracketParts);
                        var paramName = bracketParts[1];
                        if (paramName[paramName.length - 1] === '?') {
                            // optional
                            paramName = paramName.slice(0, -1);
                        } else if (pi >= parts.length) {
                            valid = false;
                            break;
                        }
                        if (paramName.indexOf('<') !== -1) { // has <regex>
                            var matches = /<([^>]+)>/.exec(paramName);
                            paramName = paramName.replace(/<([^>]+)>/g, '');
                            item.wheres[paramName] = matches[1];
                        }
                        if (item.wheres[paramName]) {
                            var regex = new RegExp(item.wheres[paramName], 'g');
                            if (!regex.test(parts[pi])) {
                                valid = false;
                                break;
                            }
                            regex.lastIndex = 0;
                            // test for "/"
                            if (regex.test('/')) { // skip to the end
                                skipAll = true;
                            }
                        }
                        var paramValue = pi < parts.length ? parts[pi] : null;
                        if (bracketParts[0]) {
                            if (paramValue.indexOf(bracketParts[0]) !== 0) {
                                valid = false;
                                break;
                            } else {
                                paramValue = paramValue.slice(bracketParts[0].length);
                            }
                        }
                        params[paramName] = paramValue;
                        if (skipAll) {
                            params[paramName] = parts.slice(pi).join('/');
                            break;
                        }
                    }
                }
                if (pi < parts.length && !skipAll) {
                    valid = false;
                }
                if (valid) {
                    return { item: item, params: params };
                }
            }
            return null;
        };

        // do we need post,put,delete,patch,options on front-end ??
    }

    exports.RouteItem = RouteItem;
    exports.Router = Router;
})(viewiExports, viewiBring);

(function (exports, bring) {
    var BaseComponent = function () {
        this._props = {};
        this._refs = {};
        this._slots = {};
        this._element = null;
        this.emitEvent = function (name) {
            var event = arguments.length > 1 ? arguments[1] : null;
            // console.log('event has been raised:', name, event, 'ON', this);
            if (this.$_callbacks && name in this.$_callbacks) {
                this.$_callbacks[name](event);
            }
        }
    }

    var $base = function (instance) {
        BaseComponent.apply(instance);
    }
    exports.BaseComponent = BaseComponent;
    exports.$base = $base;
})(viewiExports, viewiBring);
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

var SignUpPage = function () {
    var $this = this;
    $base(this);
    this.title = "Create a MyshopOS account";
    this.countries = [];
    this.fruits = ["Orange", "Apple"] ;
    var http = null;
    var router = null;

    this.__init = function (_http, _router) {
        http = _http;
        router = _router;
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
        http.get('/viewi-app/assets/static/data/countries.json') .then(function (data) {
            console.log(data);
            // $this->countries = json_decode(json_encode($data));
            $this.countries = (data);
        },function (error) {
            console.log(error);
        });
    };

    this.popCountries = function () {
        // $this->http->get('/viewi-app/assets/static/js/countries.json')
        // ->then(function($data){
        //     echo $data;
        // }, function($error){
        //     echo $error;
        // });
        // echo file_get_contents('/viewi-app/assets/static/js/countries.json');
        // <<<'javascript'
        //     const resp = fetch('/viewi-app/assets/static/js/countries.json')
        //     .then(resp => resp.ok && resp.json())
        //     .then(data => {
        //         console.log(data);
        //         $onClickOutside = "Hello";
        //         document.querySelector('#country').value = "";
        //     })
        //     javascript;        
    };

    this.handleSubmit = function (event) {
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

var CoreValues = function () {
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
    exports.CoreValues = CoreValues;

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

// use Application\Components\Services\Demo\CounterState;
var NavBar = function () {
    var $this = this;
    $base(this);
    // public CounterState $counter;
    this.currentUrl = '';
    // public function __init(CounterState $counterState)
    // {
    //     $this->counter = $counterState;
    // }   
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
};

    exports.FeaturesPage = FeaturesPage;

var HardwarePage = function () {
    var $this = this;
    $base(this);
    this.title = 'Hardware';
    
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
ViewiPages = '{"HttpClient":{"dependencies":[{"argName":"asyncStateManager","name":"AsyncStateManager"}],"service":true},"AsyncStateManager":{"service":true},"ClientRouter":{"dependencies":[{"argName":"httpContext","name":"IHttpContext"}],"service":true},"CounterState":{"service":true},"ForgotPasswordPage":{"dependencies":[{"argName":"http","name":"HttpClient"},{"argName":"clientRouter","name":"ClientRouter"},{"argName":"counterState","name":"CounterState"}],"init":true,"nodes":{"c":null,"t":"r","h":[{"c":"BaseLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-center"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"section","t":"t","h":[{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"class","t":"a","h":[{"c":"w-8 h-8 mr-2"},{"c":" "},{"c":"h-8"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":" \\r\\n                    MyshopOS    \\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h1","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"}]}],"h":[{"c":"\\r\\n                        Forgot your password?\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-light text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Don\'t fret! Just type in your email and we will send you a code to reset your password!","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"form","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mt-4 space-y-4 lg:mt-5 md:space-y-5"}]},{"c":"action","t":"a","h":[{"c":"#"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Your email","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"email"}]},{"c":"name","t":"a","h":[{"c":"email"}]},{"c":"id","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}]},{"c":"placeholder","t":"a","h":[{"c":"name@company.com"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-start"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center h-5"}]}],"h":[{"c":"\\r\\n                              ","t":"x"},{"c":"input","t":"t","a":[{"c":"id","t":"a","h":[{"c":"terms"}]},{"c":"aria-describedby","t":"a","h":[{"c":"terms"}]},{"c":"type","t":"a","h":[{"c":"checkbox"}]},{"c":"class","t":"a","h":[{"c":"w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"ml-3 text-sm"}]}],"h":[{"c":"\\r\\n                              ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"terms"}]},{"c":"class","t":"a","h":[{"c":"font-light text-gray-500 dark:text-gray-300"}]}],"h":[{"c":"I accept the ","t":"x"},{"c":"a","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-medium text-primary-600 hover:underline dark:text-primary-500"}]},{"c":"href","t":"a","h":[{"c":"#"}]}],"h":[{"c":"Terms and Conditions","t":"x"}]}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"submit"}]},{"c":"class","t":"a","h":[{"c":"w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"}]}],"h":[{"c":"Reset password","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center w-full"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"hr","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"}]}]},{"c":"\\r\\n                            ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"absolute px-3 font-medium text-gray-900 -translate-x-1\\\/2 bg-white left-1\\\/2 dark:text-white dark:bg-gray-900"}]}],"h":[{"c":"or","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-center"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/signin"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500"}]}],"h":[{"c":"Return to login ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]}]}},"InputState":{"service":true},"SignInPage":{"dependencies":[{"argName":"http","name":"HttpClient"},{"argName":"clientRouter","name":"ClientRouter"},{"argName":"inputState","name":"InputState"}],"init":true,"nodes":{"c":null,"t":"r","h":[{"c":"BaseLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-end"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":" w-full sm:w-[80vw] md:w-[90vw] xl:w-[900px] gap-y-12 grid md:grid-cols-[.8fr_1fr] sm:shadow-md mx-auto"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"md:dark:bg-slate-800 m-auto w-full pt-5 md:p-8 pl-5 h-full flex md:flex-col justify-between"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"flex gap-2 items-center"}]}],"h":[{"c":"                        \\r\\n                    ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"class","t":"a","h":[{"c":"mr-2"},{"c":" "},{"c":"h-8"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":" \\r\\n                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"MyshopOS","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/images\\\/loginKeys.png"}]},{"c":"class","t":"a","h":[{"c":"w-[100px] md:w-xl md:m-auto sm:h-sm md:mx-auto"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto md:mx-0 w-full sm:max-w-xl p-4 bg-white border border-gray-200 rounded-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"form","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-6"}]},{"c":"(submit)","t":"a","h":[{"e":1,"code":"_component.login(event)","subs":["this.login()","event","this.http.post()","this.email","this.password"]}]},{"c":"autocomplete","t":"a","h":[{"c":"off"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h5","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-xl font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Sign in to access MyshopOS","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                        ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium"}]}],"h":[{"c":"Your email - ","t":"x"},{"t":"x","e":1,"code":"_component.validEmail","subs":["this.validEmail"]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"input","t":"t","a":[{"c":"model","t":"a","h":[{"e":1,"code":"_component.email","subs":["this.email"]}]},{"c":"type","t":"a","h":[{"c":"email"}]},{"c":"name","t":"a","h":[{"c":"email"}]},{"c":"id","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"}]},{"c":"placeholder","t":"a","h":[{"c":"name@company.com"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                        ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"password"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium "}]}],"h":[{"c":"Your password","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"input","t":"t","a":[{"c":"model","t":"a","h":[{"e":1,"code":"_component.password","subs":["this.password"]}]},{"c":"type","t":"a","h":[{"c":"password"}]},{"c":"name","t":"a","h":[{"c":"password"}]},{"c":"id","t":"a","h":[{"c":"password"}]},{"c":"class","t":"a","h":[{"c":"md:text-sm rounded-lg block w-full p-4 md:p-2.5"}]},{"c":"placeholder","t":"a","h":[{"c":"\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-start"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-start"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center h-5"}]}],"h":[{"c":"\\r\\n                                ","t":"x"},{"c":"input","t":"t","a":[{"c":"id","t":"a","h":[{"c":"remember"}]},{"c":"type","t":"a","h":[{"c":"checkbox"}]},{"c":"value","t":"a"},{"c":"class","t":"a","h":[{"c":"w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"}]}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"remember"}]},{"c":"class","t":"a","h":[{"c":"ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"}]}],"h":[{"c":"Remember me","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/forgot-password"}]},{"c":"class","t":"a","h":[{"c":"ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500"}]}],"h":[{"c":"Lost Password?","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"submit"}]},{"c":"class","t":"a","h":[{"c":"w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}]}],"h":[{"c":"Login to your account","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm font-medium text-gray-500 dark:text-gray-300"}]}],"h":[{"c":"\\r\\n                        Don\'t have a MyshopOS account? ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/signup"}]},{"c":"class","t":"a","h":[{"c":"text-blue-700 hover:underline dark:text-blue-500"}]}],"h":[{"c":"Create account","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto py-5 text-sm text-gray-500"}]}],"h":[{"c":"\\u00a9","t":"x"},{"t":"x","e":1,"code":"date(\'Y\')"},{"c":" MyshopOS. All Rights Reserved","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]}]}},"SignUpPage":{"dependencies":[{"argName":"http","name":"HttpClient"},{"argName":"router","name":"ClientRouter"}],"init":true,"nodes":{"c":null,"t":"r","h":[{"c":"BaseLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white grid items-center"}]}],"h":[{"c":"\\r\\n        \\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid grid-cols-1 sm:grid-cols-[.7fr_1fr]"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"hidden sm:grid justify-center items-center"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/images\\\/welcome.png"}]},{"c":"class","t":"a","h":[{"c":"w-[200px] h-[200px]"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"min-h-screen flex flex-col p-4 bg-white border border-gray-200 rounded-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-xl mx-auto space-y-12"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a"}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex gap-2 items-center"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]}],"h":[{"c":"\\r\\n                                ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"class","t":"a","h":[{"c":"mr-3"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":"  \\r\\n                            ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid gap-y-3"}]}],"h":[{"c":"\\r\\n                                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-lg font-extrabold"}]}],"h":[{"c":"MyshopOS","t":"x"}]},{"c":"\\r\\n                                ","t":"x"},{"c":"p","t":"t","h":[{"c":"\\r\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Already have an account","t":"x"}]},{"c":"\\r\\n                                    ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/signin"}]},{"c":"class","t":"a","h":[{"c":"text-blue-700 hover:underline dark:text-blue-500"}]}],"h":[{"c":"Signin","t":"x"}]},{"c":"\\r\\n                                ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"                    \\r\\n                    ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"form","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-6"}]},{"c":"(submit)","t":"a","h":[{"e":1,"code":"_component.handleSubmit(event)","subs":["this.handleSubmit()","event"]}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"h5","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-xl font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Create a free account and experience full-featured premium plan for 14 days.","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"company_name"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Company Name","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"text"}]},{"c":"name","t":"a","h":[{"c":"company_name"}]},{"c":"id","t":"a","h":[{"c":"company_name"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"}]},{"c":"placeholder","t":"a","h":[{"c":"your business name"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Your email","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"email"}]},{"c":"name","t":"a","h":[{"c":"email"}]},{"c":"id","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"}]},{"c":"placeholder","t":"a","h":[{"c":"name@company.com"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"password"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Your password","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"password"}]},{"c":"name","t":"a","h":[{"c":"password"}]},{"c":"id","t":"a","h":[{"c":"password"}]},{"c":"placeholder","t":"a","h":[{"c":"\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"country"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}]}],"h":[{"c":"Company Location","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"select","t":"t","a":[{"c":"id","t":"a","h":[{"c":"country"}]},{"c":"class","t":"a","h":[{"c":"bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}]},{"c":"required","t":"a"}],"h":[{"c":"\\r\\n                                ","t":"x"},{"c":"option","t":"t","a":[{"c":"selected","t":"a"}],"h":[{"c":"Choose a country","t":"x"}]},{"c":"\\r\\n                                ","t":"x"},{"c":"template","t":"t","a":[{"c":"foreach","t":"a","h":[{"e":1,"code":"_component.countries as i=>v","subs":["this.countries","i","v"],"forData":"_component.countries","forKey":"i","forItem":"v"}]}],"h":[{"c":"\\r\\n                                    ","t":"x"},{"c":"option","t":"t","a":[{"c":"value","t":"a","h":[{"e":1,"code":"v.id","subs":["this.countries[key].id"]}]}],"h":[{"t":"x","e":1,"code":"v.name","subs":["this.countries[key].name"]}]},{"c":"\\r\\n                                ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto -mt-5"}]}],"h":[{"c":"Your data will be stored in US Data Center","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex gap-2 items-center"}]}],"h":[{"c":"\\r\\n                            ","t":"x"},{"c":"input","t":"t","a":[{"c":"id","t":"a","h":[{"c":"remember"}]},{"c":"type","t":"a","h":[{"c":"checkbox"}]},{"c":"value","t":"a"},{"c":"class","t":"a","h":[{"c":"w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"}]},{"c":"required","t":"a"}]},{"c":"\\r\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm"}]}],"h":[{"c":"\\r\\n                                I agree to the ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/terms-of-service"}]},{"c":"class","t":"a","h":[{"c":"ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500"}]}],"h":[{"c":"Terms of service","t":"x"}]},{"c":" and  ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/privacy-policy"}]},{"c":"class","t":"a","h":[{"c":"ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500"}]}],"h":[{"c":"Privacy Policy","t":"x"}]},{"c":"\\r\\n                            ","t":"x"}]},{"c":"                        \\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"submit"}]},{"c":"class","t":"a","h":[{"c":"w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg sm:text-sm px-5 py-4 sm:py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}]}],"h":[{"c":"Create your account","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]},{"c":"\\r\\n","t":"x"}]}},"AppBar":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-[#f7f5ff] dark:bg-gray-900"}]}],"h":[{"c":"  \\n  ","t":"x"},{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"marketing-banner"}]},{"c":"tabindex","t":"a","h":[{"c":"-1"}]},{"c":"class","t":"a","h":[{"c":"fixed z-50 flex flex-col md:flex-row justify-between w-[calc(100%-2rem)] p-4 -translate-x-1\\\/2 bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-7xl left-1\\\/2 top-6 dark:bg-gray-700 dark:border-gray-600"}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-start mb-3 mr-4 md:items-center md:flex-row md:mb-0"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/flowbite.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"flex items-center mb-2 border-gray-200 md:pr-4 md:mr-4 md:border-r md:mb-0 dark:border-gray-600"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.com\\\/docs\\\/images\\\/logo.svg"}]},{"c":"class","t":"a","h":[{"c":"h-6 mr-2"}]},{"c":"alt","t":"a","h":[{"c":"Flowbite Logo"}]}]},{"c":"\\n            ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"self-center text-lg font-semibold whitespace-nowrap dark:text-white"}]}],"h":[{"c":"Flowbite","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Build websites even faster with components on top of Tailwind CSS","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center flex-shrink-0"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"px-5 py-2 mr-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"}]}],"h":[{"c":"Sign up","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"button","t":"t","a":[{"c":"data-dismiss-target","t":"a","h":[{"c":"#marketing-banner"}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"li li-close"}]}]},{"c":"\\n            ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Close banner","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n","t":"x"}]}]}},"AppUpdateBanner":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"banner"}]},{"c":"tabindex","t":"a","h":[{"c":"-1"}]},{"c":"class","t":"a","h":[{"c":"flex fixed z-50 gap-8 justify-between items-start py-3 px-4 w-full bg-gray-50 border border-b border-gray-200 sm:items-center dark:border-gray-700 lg:py-4 dark:bg-gray-800"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm font-light text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Supercharge your hiring by taking advantage of our ","t":"x"},{"c":"a","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-medium underline text-primary-600 dark:text-primary-500 hover:no-underline"}]},{"c":"href","t":"a","h":[{"c":"#"}]}],"h":[{"c":"limited-time sale","t":"x"}]},{"c":" for Designer Search + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"button","t":"t","a":[{"c":"data-collapse-toggle","t":"a","h":[{"c":"banner"}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"flex items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"  \\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]}]}},"CookieNoticeBanner":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"banner"}]},{"c":"tabindex","t":"a","h":[{"c":"-1"}]},{"c":"class","t":"a","h":[{"c":"flex fixed z-50 gap-8 justify-between items-start py-3 px-4 w-full bg-gray-50 border border-b border-gray-200 sm:items-center dark:border-gray-700 lg:py-4 dark:bg-gray-800"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm font-light text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Supercharge your hiring by taking advantage of our ","t":"x"},{"c":"a","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-medium underline text-primary-600 dark:text-primary-500 hover:no-underline"}]},{"c":"href","t":"a","h":[{"c":"#"}]}],"h":[{"c":"limited-time sale","t":"x"}]},{"c":" for Designer Search + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"button","t":"t","a":[{"c":"data-collapse-toggle","t":"a","h":[{"c":"banner"}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"flex items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"  \\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]}]}},"MobileApp":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-full p-4 text-center bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"h5","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-3xl font-bold text-gray-900 dark:text-white"}]}],"h":[{"c":"Work fast from anywhere","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400"}]}],"h":[{"c":"Stay up to date and move work forward with MyshopOS on iOS & Android. Download the app today.","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex gap-5 items-center justify-center"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"w-full sm:w-auto bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 text-white rounded-lg inline-flex items-center justify-center px-4 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mr-3 w-7 h-7"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]},{"c":"focusable","t":"a","h":[{"c":"false"}]},{"c":"data-prefix","t":"a","h":[{"c":"fab"}]},{"c":"data-icon","t":"a","h":[{"c":"apple"}]},{"c":"role","t":"a","h":[{"c":"img"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 384 512"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"d","t":"a","h":[{"c":"M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"}]}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-xs"}]}],"h":[{"c":"Download on the","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"-mt-1 font-sans text-sm font-semibold"}]}],"h":[{"c":"Mac App Store","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"w-full sm:w-auto bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 text-white rounded-lg inline-flex items-center justify-center px-4 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mr-3 w-7 h-7"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]},{"c":"focusable","t":"a","h":[{"c":"false"}]},{"c":"data-prefix","t":"a","h":[{"c":"fab"}]},{"c":"data-icon","t":"a","h":[{"c":"google-play"}]},{"c":"role","t":"a","h":[{"c":"img"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 512 512"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"d","t":"a","h":[{"c":"M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"}]}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-xs"}]}],"h":[{"c":"Get in on","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"-mt-1 font-sans text-sm font-semibold"}]}],"h":[{"c":"Google Play","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]},{"c":"\\r\\n","t":"x"}]}},"CoreValues":{"nodes":{"c":null,"t":"r","h":[{"c":"section","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-white dark:bg-gray-900"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-screen-md mx-auto mb-8 lg:mb-16"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white"}]}],"h":[{"c":"Designed for business teams like yours","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 sm:text-xl dark:text-gray-400"}]}],"h":[{"c":"Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Marketing","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Plan it, create it, launch it. Collaborate seamlessly with all  the organization and hit your marketing goals every month with our marketing plan.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"d","t":"a","h":[{"c":"M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"}]}]}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Legal","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Protect your organization, devices and stay compliant with our structured workflows and custom permissions made for you.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]},{"c":"path","t":"t","a":[{"c":"d","t":"a","h":[{"c":"M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"}]}]}]},{"c":"                    \\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Business Automation","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Auto-assign tasks, send Slack messages, and much more. Now power up with hundreds of new templates to help you get started.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"d","t":"a","h":[{"c":"M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"}]}]},{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Finance","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Audit-proof software built for critical financial operations like month-end close and quarterly budgeting.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"d","t":"a","h":[{"c":"M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"}]}]}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Enterprise Design","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Craft beautiful, delightful experiences for both marketing and product with real cross-company collaboration.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-xl font-bold dark:text-white"}]}],"h":[{"c":"Operations","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Keep your company\\u2019s lights on with customizable, iterative, and structured workflows built for all efficient teams and individual.","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]}]}},"Footer":{"nodes":{"c":null,"t":"r","h":[{"c":"MobileApp","t":"c"},{"c":"\\r\\n\\r\\n","t":"x"},{"c":"footer","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-gray-50 dark:bg-gray-900"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"md:grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] md:justify-between gap-20"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-6 md:mb-0 space-y-5"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"flex items-center"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"class","t":"a","h":[{"c":"h-8 mr-3"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"self-center text-2xl font-semibold whitespace-nowrap dark:text-white"}]}],"h":[{"c":"MyshopOS","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid relative"}]}],"h":[{"c":"                    \\r\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-[200px] max-w-full rounded-lg"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/docs\\\/gallery\\\/square\\\/image-1.jpg"}]},{"c":"alt","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-[200px] max-w-full rounded-lg"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/docs\\\/gallery\\\/square\\\/image-2.jpg"}]},{"c":"alt","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-[200px] max-w-full rounded-lg"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/docs\\\/gallery\\\/square\\\/image-3.jpg"}]},{"c":"alt","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-[200px] max-w-full rounded-lg"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/docs\\\/gallery\\\/square\\\/image-4.jpg"}]},{"c":"alt","t":"a"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid grid-cols-[auto_auto] gap-8 md:gap-10 sm:grid-cols-[auto_auto_auto_auto] justify-between"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white"}]}],"h":[{"c":"Features","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/invoicing"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Invoicing","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/expenses"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Expenses","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/inventory"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Inventory","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/po"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Purchase Orders","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/mr"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Stock Movement","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/expenses"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Bills","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/estimates"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Estimates","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/sales"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Sales Orders","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/sales"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Credit Notes","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/help.myshopos.com\\\/reporing"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Reporting","t":"x"}]}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white"}]}],"h":[{"c":"Solutions","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/myshopos.com"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"MyshopOS","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/yorwor.com"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Yorwor","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/hiregaps.com"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"HireGaps","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/crm.myshop.com"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"CRM","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/tailwindcss.com"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Desktop App","t":"x"}]}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white"}]}],"h":[{"c":"Resources","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/flowbite.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Help Docs","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/tailwindcss.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"FAQS","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/tailwindcss.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Forums","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/tailwindcss.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"What\'s New","t":"x"}]}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/tailwindcss.com\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Release Notes","t":"x"}]}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\r\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-6 text-sm font-extrabold text-gray-900 uppercase dark:text-white"}]}],"h":[{"c":"Legal","t":"x"}]},{"c":"\\r\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:text-sm text-gray-500 dark:text-gray-400 font-medium space-y-4"}]}],"h":[{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Privacy Policy","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\r\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"Terms & Conditions","t":"x"}]},{"c":"\\r\\n                        ","t":"x"}]},{"c":"\\r\\n                    ","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"hr","t":"t","a":[{"c":"class","t":"a","h":[{"c":"my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"}]}]},{"c":"\\r\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-center sm:text-left sm:flex sm:items-center sm:justify-between"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm text-gray-500 sm:text-center dark:text-gray-400"}]}],"h":[{"c":"\\u00a9 ","t":"x"},{"t":"x","e":1,"code":"date(\'Y\')"},{"c":" ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"hover:underline"}]}],"h":[{"c":"MyshopOS","t":"x"}]},{"c":". All Rights Reserved.","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center mt-4 space-x-5 sm:justify-center sm:mt-0"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/web.facebook.com\\\/people\\\/Myshop-OS\\\/100064781571456\\\/"}]},{"c":"class","t":"a","h":[{"c":"p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-facebook text-blue-500 text-xl"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Facebook page","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/discord.gg\\\/fx3RPw8A"}]},{"c":"class","t":"a","h":[{"c":"p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-discord-alt text-xl"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Discord community","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"twitter.com\\\/MyshopOs"}]},{"c":"class","t":"a","h":[{"c":"p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-twitter text-blue-900 text-xl"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Twitter page","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"instagram.com\\\/my_shopos"}]},{"c":"class","t":"a","h":[{"c":"p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-instagram text-purple-500 text-xl"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Instagram Page","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/www.youtube.com\\\/myshopos"}]},{"c":"class","t":"a","h":[{"c":"p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-150 duration-300"}]}],"h":[{"c":"\\r\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-youtube text-red-500 text-xl"}]}]},{"c":"\\r\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Youtube","t":"x"}]},{"c":"\\r\\n                ","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]},{"c":"\\r\\n","t":"x"}]}},"Hero":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-[#f7f5ff] dark:bg-gray-900"}]}],"h":[{"c":"\\n  ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"md:h-auto grid gap-y-10 items-center md:grid-cols-[1fr_.8fr] lg:grid-cols-[1fr_.8fr] max-w-screen-xl mx-auto py-8 sm:py-8 md:py-24"}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:text-left grid items-center px-4"}]}],"h":[{"c":"\\n      ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto md:mx-0 max-w-xl text-center md:text-left"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-[#f5f7ff] rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"}]},{"c":"role","t":"a","h":[{"c":"alert"}]}],"h":[{"c":"\\n          ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3"}]}],"h":[{"c":"New","t":"x"}]},{"c":" ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm font-medium"}]}],"h":[{"c":"Myshop Operating Solution","t":"x"}]},{"c":" \\n          ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-chevron-right ml-2"}]}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"h1","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mb-4 text-[8vw] font-extrabold tracking-tight leading-none sm:text-[3.2rem] md:text-[4.8vw] lg:text-[3.2rem] xl:text-[3.4rem] dark:text-white"}]}],"h":[{"c":"Smart Billing Software ","t":"x"},{"c":"br","t":"t"},{"c":"for businesses.","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-md lg:text-md dark:text-gray-400"}]}],"h":[{"c":"From checkout to global sales tax compliance, companies around the world use MyshopOS to manage merchandise and simplify their billing needs.","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex- sm:flex-row gap-5 justify-center md:justify-start"}]}],"h":[{"c":"\\n          ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/signup"}]},{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"}]}],"h":[{"c":"\\n            Free 14-day Demo ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-arrow-right ml-2 -mr-1"}]}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n          ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/contact"}]},{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"}]}],"h":[{"c":"Speak to Sales","t":"x"}]},{"c":" \\n        ","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n    ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\n      ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/screenshots\\\/all-devices-white.png"}]},{"c":"alt","t":"a","h":[{"c":"mockup"}]},{"c":"class","t":"a","h":[{"c":"h-[230px] sm:h-[20vh] sm:h-[30vh] mx-auto md:mx-0"}]}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n","t":"x"}]}]}},"NavBar":{"nodes":{"c":null,"t":"r","h":[{"c":"nav","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600"}]}],"h":[{"c":"\\n  ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-2"}]}],"h":[{"c":"\\n  ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"flex items-center"}]}],"h":[{"c":"\\n      ","t":"x"},{"c":"img","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"class","t":"a","h":[{"c":"h-8 mr-3"}]},{"c":"alt","t":"a","h":[{"c":"MyshopOS Logo"}]}]},{"c":"\\n      ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"self-center text-2xl font-semibold whitespace-nowrap dark:text-white"}]}],"h":[{"c":"MyshopOS","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n  ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex md:order-2"}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/signin"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500\\\/50 dark:shadow-lg dark:shadow-blue-800\\\/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "}]}],"h":[{"c":"Sign In","t":"x"}]},{"c":"\\n      ","t":"x"},{"c":"button","t":"t","a":[{"c":"data-collapse-toggle","t":"a","h":[{"c":"navbar-sticky"}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"}]},{"c":"aria-controls","t":"a","h":[{"c":"navbar-sticky"}]},{"c":"aria-expanded","t":"a","h":[{"c":"false"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sr-only"}]}],"h":[{"c":"Open main menu","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-5 h-5"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]},{"c":"fill","t":"a","h":[{"c":"none"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 17 14"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"path","t":"t","a":[{"c":"stroke","t":"a","h":[{"c":"currentColor"}]},{"c":"stroke-linecap","t":"a","h":[{"c":"round"}]},{"c":"stroke-linejoin","t":"a","h":[{"c":"round"}]},{"c":"stroke-width","t":"a","h":[{"c":"2"}]},{"c":"d","t":"a","h":[{"c":"M1 1h15M1 7h15M1 13h15"}]}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n  ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"items-center justify-between hidden w-full md:flex md:w-auto md:order-1"}]},{"c":"id","t":"a","h":[{"c":"navbar-sticky"}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row space-x-4 lg:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"}]}],"h":[{"c":"\\n      ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/features"}]},{"c":"id","t":"a","h":[{"c":"mega-menu-dropdown-button"}]},{"c":"data-dropdown-toggle","t":"a","h":[{"c":"mega-menu-dropdown"}]},{"c":"data-dropdown-trigger","t":"a","h":[{"c":"hover"}]},{"c":"class","t":"a","h":[{"c":"flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-900 border-b border-gray-100 md:w-auto hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700"}]}],"h":[{"c":"\\n          Features \\n          ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-chevron-down ml-2.5"}]}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"mega-menu-dropdown"}]},{"c":"class","t":"a","h":[{"c":"absolute z-10 grid hidden w-auto grid-cols-2 text-sm bg-white border border-gray-100 rounded-lg shadow-md dark:border-gray-700 md:grid-cols-3 dark:bg-gray-700"}]}],"h":[{"c":"\\n          ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4 pb-0 text-gray-900 md:pb-4 dark:text-white"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-4"}]},{"c":"aria-labelledby","t":"a","h":[{"c":"mega-menu-dropdown-button"}]}],"h":[{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"About Us","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Library","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Resources","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Pro Version","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n          ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4 pb-0 text-gray-900 md:pb-4 dark:text-white"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-4"}]}],"h":[{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Blog","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Newsletter","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Playground","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"License","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n          ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-4"}]}],"h":[{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Contact Us","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Support Center","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n              ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"}]}],"h":[{"c":"Terms","t":"x"}]},{"c":"\\n              ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n      ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/pricing"}]},{"c":"class","t":"a","h":[{"c":"block py-2 pl-1 pr-4 "},{"e":1,"code":"_component.currentUrl == \'pricing\' ? \'md:text-blue-700\':\'md:text-gray-900\'","subs":["this.currentUrl"]},{"c":" rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"}]}],"h":[{"c":"Pricing","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n      ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/services"}]},{"c":"class","t":"a","h":[{"c":"block py-2 pl-1 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"}]}],"h":[{"c":"Services","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n      ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center gap-1"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/hardware"}]},{"c":"class","t":"a","h":[{"c":"block py-2 pl-1 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"}]}],"h":[{"c":"Hardware","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n      ","t":"x"},{"c":" <li class=\\"flex items-center gap-1\\">\\n        <a href=\\"\\\/resources\\" class=\\"block py-2 pl-1 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700\\">Resources<\\\/a>\\n      <\\\/li> ","t":"m"},{"c":"\\n      ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n        ","t":"x"},{"c":"button","t":"t","a":[{"c":"id","t":"a","h":[{"c":"dropdownNavbarLink"}]},{"c":"data-dropdown-toggle","t":"a","h":[{"c":"dropdownNavbar"}]},{"c":"data-dropdown-trigger","t":"a","h":[{"c":"hover"}]},{"c":"class","t":"a","h":[{"c":"flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"}]}],"h":[{"c":"\\n          Resources \\n          ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-chevron-down ml-2.5"}]}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n        ","t":"x"},{"c":" Dropdown menu ","t":"m"},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"dropdownNavbar"}]},{"c":"class","t":"a","h":[{"c":"z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"}]}],"h":[{"c":"\\n          ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-2 text-sm text-gray-700 dark:text-gray-400"}]},{"c":"aria-labelledby","t":"a","h":[{"c":"dropdownLargeButton"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n              ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/help-docs"}]},{"c":"class","t":"a","h":[{"c":"block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"Help Guide","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n              ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/faqs"}]},{"c":"class","t":"a","h":[{"c":"block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"FAQs","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n              ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/video-tutorials"}]},{"c":"class","t":"a","h":[{"c":"block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"Video Tutorials","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n              ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/forum"}]},{"c":"class","t":"a","h":[{"c":"block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}]}],"h":[{"c":"Forum Discussion","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n          ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-1"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"}]}],"h":[{"c":"MyshopOS Blog","t":"x"}]},{"c":"\\n          ","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n      ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n  ","t":"x"}]},{"c":"\\n","t":"x"}]},{"c":"\\n","t":"x"}]}},"SideBar":{"nodes":{"c":null,"t":"r","h":[{"c":"aside","t":"t","a":[{"c":"id","t":"a","h":[{"c":"logo-sidebar"}]},{"c":"class","t":"a","h":[{"c":"fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"}]},{"c":"aria-label","t":"a","h":[{"c":"Sidebar"}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-2 font-medium"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-grid-alt flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"ml-3"}]}],"h":[{"c":"Dashboard","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-hospital flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Dashboard","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300"}]}],"h":[{"c":"Pro","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/patients"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-network flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Patients","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"}]}],"h":[{"c":"3","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/consultation"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-pencil-alt flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Consultation","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"}]}],"h":[{"c":"3","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/insurance"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-add-files flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Insurance","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"}]}],"h":[{"c":"3","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/appointments"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-alarm-clock flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Appointments","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/inventory"}]},{"c":"class","t":"a","h":[{"c":"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-shopping-basket flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 whitespace-nowrap"}]}],"h":[{"c":"Inventory","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"}]},{"c":"aria-controls","t":"a","h":[{"c":"dropdown-example"}]},{"c":"data-collapse-toggle","t":"a","h":[{"c":"dropdown-example"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-cog flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]}]},{"c":"\\n                    ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-1 ml-3 text-left whitespace-nowrap"}]}],"h":[{"c":"Settings","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"w-3 h-3"}]},{"c":"aria-hidden","t":"a","h":[{"c":"true"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]},{"c":"fill","t":"a","h":[{"c":"none"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 10 6"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"path","t":"t","a":[{"c":"stroke","t":"a","h":[{"c":"currentColor"}]},{"c":"stroke-linecap","t":"a","h":[{"c":"round"}]},{"c":"stroke-linejoin","t":"a","h":[{"c":"round"}]},{"c":"stroke-width","t":"a","h":[{"c":"2"}]},{"c":"d","t":"a","h":[{"c":"m1 1 4 4 4-4"}]}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"ul","t":"t","a":[{"c":"id","t":"a","h":[{"c":"dropdown-example"}]},{"c":"class","t":"a","h":[{"c":"hidden py-2 space-y-2"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/organization"}]},{"c":"class","t":"a","h":[{"c":"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"}]}],"h":[{"c":"Organization","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/users"}]},{"c":"class","t":"a","h":[{"c":"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"}]}],"h":[{"c":"Users","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"li","t":"t","h":[{"c":"\\n                        ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/subscription"}]},{"c":"class","t":"a","h":[{"c":"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"}]}],"h":[{"c":"Subscription","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":" <li>\\n                <a href=\\"#\\" class=\\"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group\\">\\n                    <svg class=\\"flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white\\" aria-hidden=\\"true\\" xmlns=\\"http:\\\/\\\/www.w3.org\\\/2000\\\/svg\\" fill=\\"none\\" viewBox=\\"0 0 18 16\\">\\n                    <path stroke=\\"currentColor\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3\\"\\\/>\\n                    <\\\/svg>\\n                    <span class=\\"flex-1 ml-3 whitespace-nowrap\\">Sign In<\\\/span>\\n                <\\\/a>\\n            <\\\/li>\\n            <li>\\n                <a href=\\"#\\" class=\\"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group\\">\\n                    <svg class=\\"flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white\\" aria-hidden=\\"true\\" xmlns=\\"http:\\\/\\\/www.w3.org\\\/2000\\\/svg\\" fill=\\"currentColor\\" viewBox=\\"0 0 20 20\\">\\n                    <path d=\\"M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z\\"\\\/>\\n                    <path d=\\"M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z\\"\\\/>\\n                    <path d=\\"M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z\\"\\\/>\\n                    <\\\/svg>\\n                    <span class=\\"flex-1 ml-3 whitespace-nowrap\\">Sign Up<\\\/span>\\n                <\\\/a>\\n            <\\\/li> ","t":"m"},{"c":"\\n       ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n ","t":"x"}]}]}},"Testimonial":{"nodes":{"c":null,"t":"r","h":[{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid mb-8 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 md:mb-12 md:grid-cols-2"}]}],"h":[{"c":"\\r\\n    ","t":"x"},{"c":"figure","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"blockquote","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Very easy this was to integrate","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"my-4"}]}],"h":[{"c":"If you care for your time, I hands down would go with this.\\"","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"figcaption","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center justify-center space-x-3"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"rounded-full w-9 h-9"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/blocks\\\/marketing-ui\\\/avatars\\\/karen-nelson.png"}]},{"c":"alt","t":"a","h":[{"c":"profile picture"}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-0.5 font-medium dark:text-white text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"Bonnie Green","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Developer at Open AI","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"    \\r\\n    ","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"figure","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-tr-lg dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"blockquote","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Solid foundation for any project","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"my-4"}]}],"h":[{"c":"Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!\\"","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"figcaption","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center justify-center space-x-3"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"rounded-full w-9 h-9"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/blocks\\\/marketing-ui\\\/avatars\\\/roberta-casas.png"}]},{"c":"alt","t":"a","h":[{"c":"profile picture"}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-0.5 font-medium dark:text-white text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"Roberta Casas","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Lead designer at Dropbox","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"    \\r\\n    ","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"figure","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-bl-lg md:border-b-0 md:border-r dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"blockquote","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Mindblowing workflow","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"my-4"}]}],"h":[{"c":"Aesthetically, the well designed components are beautiful and will undoubtedly level up your next application.\\"","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"figcaption","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center justify-center space-x-3"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"rounded-full w-9 h-9"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/blocks\\\/marketing-ui\\\/avatars\\\/jese-leos.png"}]},{"c":"alt","t":"a","h":[{"c":"profile picture"}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-0.5 font-medium dark:text-white text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"Jese Leos","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Software Engineer at Facebook","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"    \\r\\n    ","t":"x"}]},{"c":"\\r\\n    ","t":"x"},{"c":"figure","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col items-center justify-center p-8 text-center bg-white border-gray-200 rounded-b-lg md:rounded-br-lg dark:bg-gray-800 dark:border-gray-700"}]}],"h":[{"c":"\\r\\n        ","t":"x"},{"c":"blockquote","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Efficient Collaborating","t":"x"}]},{"c":"\\r\\n            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"my-4"}]}],"h":[{"c":"You have many examples that can be used to create a fast prototype for your team.\\"","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"\\r\\n        ","t":"x"},{"c":"figcaption","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center justify-center space-x-3"}]}],"h":[{"c":"\\r\\n            ","t":"x"},{"c":"img","t":"t","a":[{"c":"class","t":"a","h":[{"c":"rounded-full w-9 h-9"}]},{"c":"src","t":"a","h":[{"c":"https:\\\/\\\/flowbite.s3.amazonaws.com\\\/blocks\\\/marketing-ui\\\/avatars\\\/joseph-mcfall.png"}]},{"c":"alt","t":"a","h":[{"c":"profile picture"}]}]},{"c":"\\r\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-0.5 font-medium dark:text-white text-left"}]}],"h":[{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"Joseph McFall","t":"x"}]},{"c":"\\r\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-sm text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"CTO at Google","t":"x"}]},{"c":"\\r\\n            ","t":"x"}]},{"c":"\\r\\n        ","t":"x"}]},{"c":"    \\r\\n    ","t":"x"}]},{"c":"\\r\\n","t":"x"}]},{"c":"\\r\\n","t":"x"}]}},"ContactPage":{"dependencies":[{"argName":"http","name":"HttpClient"}],"init":true,"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":" <p>\\n            ","t":"m"},{"t":"m","e":1,"code":"_component.statusMessage","subs":["this.statusMessage"]},{"c":"\\n        <\\\/p>\\n        <p>\\n            Data: ","t":"m"},{"t":"m","e":1,"code":"_component.data","subs":["this.data"]},{"c":"\\n        <\\\/p> ","t":"m"},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-screen-xl mx-auto space-y-10"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mt-5 mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white"}]}],"h":[{"c":"How can we help you?","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"form","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-xl mx-auto"}]}],"h":[{"c":"   \\n                ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"default-search"}]},{"c":"class","t":"a","h":[{"c":"mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"}]}],"h":[{"c":"Search","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"relative"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"i","t":"t","a":[{"c":"class","t":"a","h":[{"c":"lni lni-search-alt text-gray-500 dark:text-gray-400"}]}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"search"}]},{"c":"id","t":"a","h":[{"c":"default-search"}]},{"c":"class","t":"a","h":[{"c":"block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}]},{"c":"placeholder","t":"a","h":[{"c":"Type keywords to find answers"}]},{"c":"required","t":"a"}]},{"c":"\\n                    ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"submit"}]},{"c":"class","t":"a","h":[{"c":"text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}]}],"h":[{"c":"Search","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid sm:grid-cols-2 md:grid-cols-3 justify-center gap-5 lg:gap-10"}]}],"h":[{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Billing & Plans","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Flowbite plans & prices","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Switch plans and add-ons","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"I can\'t login to MyshopOS","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Discount on MyshopOS","t":"x"}]}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Using MyshopOS","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Devices to run MyshopOS","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Managing Inventory","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Fix Network Issues","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"MyshopOS offline","t":"x"}]}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"block max-w-md min-w-[95vw] sm:min-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-lg font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"What\'s on MyshopOS","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"ul","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-md space-y-3 text-gray-500 list-none list-inside dark:text-gray-400"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"New this month!","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Multi-store Locations","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Pricing per quantity","t":"x"}]}]},{"c":"\\n                        ","t":"x"},{"c":"li","t":"t","h":[{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"text-blue-500 hover:underline"}]}],"h":[{"c":"Hire store worker","t":"x"}]}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col sm:flex-row gap-2 justify-between items-center"}]}],"h":[{"c":"\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-2xl font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Not what you were looking for?:","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-gray-900 dark:text-white"}]}],"h":[{"c":"Browse through all of our Help Center articles","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/contact"}]},{"c":"class","t":"a","h":[{"c":"inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"}]}],"h":[{"c":"Get Started","t":"x"}]},{"c":" \\n            ","t":"x"}]},{"c":"\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid sm:grid-cols-2 gap-10 justify-center sm:justify-between py-8"}]}],"h":[{"c":"\\n                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-2xl font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Points of contact","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"dl","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-md py-8 text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col pb-3"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"dt","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-gray-500 md:text-lg dark:text-gray-400"}]}],"h":[{"c":"Information & Sales","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"dd","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold"}]}],"h":[{"c":"sales@myshopos.com","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col py-3"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"dt","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-gray-500 md:text-lg dark:text-gray-400"}]}],"h":[{"c":"Support","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"dd","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold"}]}],"h":[{"c":"support@myshopos.com","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col py-3"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"dt","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-gray-500 md:text-lg dark:text-gray-400"}]}],"h":[{"c":"Accra office","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"dd","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold"}]}],"h":[{"c":"Katamanso Road, Amrahia, Accra, Ghana","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col pt-3"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"dt","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-1 text-gray-500 md:text-lg dark:text-gray-400"}]}],"h":[{"c":"Phone number","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"dd","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-lg font-semibold"}]}],"h":[{"c":"+233 362 195 587 \\\/ +233 542 795 439","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"                    \\n                ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"grid"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-2 text-2xl font-semibold text-gray-900 dark:text-white"}]}],"h":[{"c":"Still need help?:","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"section","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-white dark:bg-gray-900"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-8"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":" <h2 class=\\"mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white\\">Contact Us<\\\/h2>\\n                            <p class=\\"mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl\\">Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.<\\\/p> ","t":"m"},{"c":"\\n                            ","t":"x"},{"c":"form","t":"t","a":[{"c":"action","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"space-y-8"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\n                                    ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"}]}],"h":[{"c":"Your email","t":"x"}]},{"c":"\\n                                    ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"email"}]},{"c":"id","t":"a","h":[{"c":"email"}]},{"c":"class","t":"a","h":[{"c":"shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-4 md:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"}]},{"c":"placeholder","t":"a","h":[{"c":"name@flowbite.com"}]},{"c":"required","t":"a"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"div","t":"t","h":[{"c":"\\n                                    ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"subject"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"}]}],"h":[{"c":"Subject","t":"x"}]},{"c":"\\n                                    ","t":"x"},{"c":"input","t":"t","a":[{"c":"type","t":"a","h":[{"c":"text"}]},{"c":"id","t":"a","h":[{"c":"subject"}]},{"c":"class","t":"a","h":[{"c":"block p-3 w-full p-4 md:p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"}]},{"c":"placeholder","t":"a","h":[{"c":"Let us know how we can help you"}]},{"c":"required","t":"a"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"sm:col-span-2"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":"label","t":"t","a":[{"c":"for","t":"a","h":[{"c":"message"}]},{"c":"class","t":"a","h":[{"c":"block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"}]}],"h":[{"c":"Your message","t":"x"}]},{"c":"\\n                                    ","t":"x"},{"c":"textarea","t":"t","a":[{"c":"id","t":"a","h":[{"c":"message"}]},{"c":"rows","t":"a","h":[{"c":"6"}]},{"c":"class","t":"a","h":[{"c":"block p-3 w-full p-4 md:p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"}]},{"c":"placeholder","t":"a","h":[{"c":"Leave a comment..."}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"submit"}]},{"c":"class","t":"a","h":[{"c":"py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-primary-700 w-full sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"}]}],"h":[{"c":"Send message","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n","t":"x"}]}]}},"Counter":{"nodes":{"c":null,"t":"r","h":[{"c":"button","t":"t","a":[{"c":"(click)","t":"a","h":[{"e":1,"code":"_component.decrement()","subs":["this.decrement()","this.count"]}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"-","t":"x"}]},{"c":"\\r\\n\\r\\n","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mui--text-dark mui--text-title"}]}],"h":[{"t":"x","e":1,"code":"_component.count","subs":["this.count"]}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"(click)","t":"a","h":[{"e":1,"code":"_component.increment()","subs":["this.increment()","this.count"]}]},{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"+","t":"x"}]},{"c":"\\r\\n\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Blue","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Green","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Cyan","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Teal","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Lime","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Red","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Pink","t":"x"}]},{"c":"\\r\\n","t":"x"},{"c":"button","t":"t","a":[{"c":"type","t":"a","h":[{"c":"button"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"}]}],"h":[{"c":"Purple","t":"x"}]}]}},"FeaturesPage":{"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n      \\n    ","t":"x"}]},{"c":"  \\n","t":"x"}]}]}},"HardwarePage":{"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":" <i class=\\"lni lni-save\\"><\\\/i> ","t":"m"},{"c":"\\n        \\n    ","t":"x"}]},{"c":"  \\n","t":"x"}]}]}},"HomePage":{"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"Hero","t":"c"},{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":" <i class=\\"lni lni-save\\"><\\\/i> ","t":"m"},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-screen-xl mx-auto space-y-16"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":" ","t":"m"},{"t":"m","e":1,"code":"_component.currentUrl","subs":["this.currentUrl"]},{"c":" ","t":"m"},{"c":"\\n            ","t":"x"},{"c":"CoreValues","t":"c"},{"c":"\\n            ","t":"x"},{"c":"Testimonial","t":"c"},{"c":"\\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"  \\n","t":"x"}]}]}},"BaseLayout":{"nodes":{"c":null,"t":"r","h":[{"c":"<!DOCTYPE html>\\n","t":"x"},{"c":"html","t":"t","a":[{"c":"lang","t":"a","h":[{"c":"en"}]},{"c":"class","t":"a"}],"h":[{"c":"\\n\\n","t":"x"},{"c":"head","t":"t","h":[{"c":"\\n    ","t":"x"},{"c":"title","t":"t","h":[{"c":"\\n        ","t":"x"},{"t":"x","e":1,"code":"_component.title","subs":["this.title"]},{"c":" | Myshop OS\\n    ","t":"x"}]},{"c":"\\n    ","t":"x"},{"c":"meta","t":"t","a":[{"c":"charset","t":"a","h":[{"c":"utf-8"}]}]},{"c":"\\n    ","t":"x"},{"c":"meta","t":"t","a":[{"c":"http-equiv","t":"a","h":[{"c":"X-UA-Compatible"}]},{"c":"content","t":"a","h":[{"c":"IE=edge"}]}]},{"c":"\\n    ","t":"x"},{"c":"meta","t":"t","a":[{"c":"name","t":"a","h":[{"c":"viewport"}]},{"c":"content","t":"a","h":[{"c":"width=device-width, initial-scale=.8, minimum-scale=.8, maximum-scale=1.0, user-scalable=no"}]}]},{"c":"\\n    ","t":"x"},{"c":"link","t":"t","a":[{"c":"rel","t":"a","h":[{"c":"shortcut icon"}]},{"c":"href","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/icons\\\/favicon.ico"}]},{"c":"type","t":"a","h":[{"c":"image\\\/x-icon"}]}]},{"c":"\\n    ","t":"x"},{"c":"CssBundle","t":"c","a":[{"c":"links","t":"a","h":[{"e":1,"code":"[\'\\\/viewi-app\\\/assets\\\/static\\\/css\\\/main.css\'] "}]}]},{"c":"\\n    ","t":"x"},{"c":"link","t":"t","a":[{"c":"rel","t":"a","h":[{"c":"stylesheet"}]},{"c":"href","t":"a","h":[{"c":"https:\\\/\\\/cdn.lineicons.com\\\/4.0\\\/lineicons.css"}]}]},{"c":"\\n    ","t":"x"},{"c":"script","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/static\\\/js\\\/tailwindcss@3.3.3.js"}]}]},{"c":"\\n","t":"x"}]},{"c":"\\n\\n","t":"x"},{"c":"body","t":"t","a":[{"c":"style","t":"a","h":[{"c":"font-family: \'Raleway\';"}]}],"h":[{"c":"\\n\\n    ","t":"x"},{"c":"slot","t":"t"},{"c":"\\n    \\n    ","t":"x"},{"c":"ViewiScripts","t":"c"},{"c":"\\n\\n    ","t":"x"},{"c":"script","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/viewi-app\\\/assets\\\/static\\\/js\\\/flowbite@1.8.1.min.js"}]}]},{"c":"\\n    ","t":"x"},{"c":"script","t":"t","h":[{"c":"\\n        tailwind.config = {\\n            darkMode: \'class\',\\n            theme: {\\n                extend: {\\n                    colors: {\\n                        primary: {\\"50\\":\\"#eff6ff\\",\\"100\\":\\"#dbeafe\\",\\"200\\":\\"#bfdbfe\\",\\"300\\":\\"#93c5fd\\",\\"400\\":\\"#60a5fa\\",\\"500\\":\\"#3b82f6\\",\\"600\\":\\"#2563eb\\",\\"700\\":\\"#1d4ed8\\",\\"800\\":\\"#1e40af\\",\\"900\\":\\"#1e3a8a\\",\\"950\\":\\"#172554\\"}\\n                    }\\n                },\\n                fontFamily: {\\n                    \'body\': [\\n                        \'Raleway\', \\n                        \'Poppins\', \\n                        \'Inter\', \\n                        \'ui-sans-serif\', \\n                        \'system-ui\', \\n                        \'-apple-system\', \\n                        \'system-ui\', \\n                        \'Segoe UI\', \\n                        \'Roboto\', \\n                        \'Helvetica Neue\', \\n                        \'Arial\', \\n                        \'Noto Sans\', \\n                        \'sans-serif\', \\n                        \'Apple Color Emoji\', \\n                        \'Segoe UI Emoji\', \\n                        \'Segoe UI Symbol\', \\n                        \'Noto Color Emoji\'\\n                    ],\\n                        \'sans\': [\\n                        \'Inter\', \\n                        \'ui-sans-serif\', \\n                        \'system-ui\', \\n                        \'-apple-system\', \\n                        \'system-ui\', \\n                        \'Segoe UI\', \\n                        \'Roboto\', \\n                        \'Helvetica Neue\', \\n                        \'Arial\', \\n                        \'Noto Sans\', \\n                        \'sans-serif\', \\n                        \'Apple Color Emoji\', \\n                        \'Segoe UI Emoji\', \\n                        \'Segoe UI Symbol\', \\n                        \'Noto Color Emoji\'\\n                    ]\\n                }\\n            }\\n        }\\n    ","t":"x"}]},{"c":"\\n","t":"x"}]},{"c":"\\n\\n","t":"x"}]}]}},"PublicLayout":{"nodes":{"c":null,"t":"r","h":[{"c":"BaseLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"id","t":"a","h":[{"c":"layout-main"}]},{"c":"class","t":"a","h":[{"c":"space-y-16"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"NavBar","t":"c"},{"c":"\\n        ","t":"x"},{"c":"main","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mt-12 sm:mt-15 dark:bg-slate-700"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"slot","t":"t"},{"c":"\\n        ","t":"x"}]},{"c":"           \\n        ","t":"x"},{"c":"Footer","t":"c"},{"c":"\\n    ","t":"x"}]},{"c":"\\n\\n    ","t":"x"},{"c":"ViewiScripts","t":"c"},{"c":"\\n\\n    ","t":"x"},{"c":"script","t":"t","a":[{"c":"src","t":"a","h":[{"c":"\\\/\\\/code.tidio.co\\\/rwlyw0a6tajrsjt8h9tp85it0kpxd1nk.js"}]},{"c":"async","t":"a"}]},{"c":"\\n","t":"x"}]},{"c":"\\n","t":"x"}]}},"NotFoundPage":{"nodes":{"c":null,"t":"r","h":[{"c":"BaseLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"section","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-white dark:bg-gray-900 h-screen grid"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-8 px-4 m-auto max-w-screen-xl lg:py-16 lg:px-6"}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto max-w-screen-sm text-center"}]}],"h":[{"c":"\\n                ","t":"x"},{"c":"h1","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500"}]}],"h":[{"c":"404","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white"}]}],"h":[{"c":"Something\'s missing.","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-lg font-light text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"Sorry, we can\'t find that page. You\'ll find lots to explore on the home page. ","t":"x"}]},{"c":"\\n                ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"\\\/"}]},{"c":"class","t":"a","h":[{"c":"inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"}]}],"h":[{"c":"Back to Homepage","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"   \\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"\\n","t":"x"}]}]}},"Post":{"nodes":{"c":null,"t":"r","h":[{"c":"p","t":"t","h":[{"t":"x","e":1,"code":"_component.content","subs":["this.content"]}]},{"c":"\\r\\n\\r\\n","t":"x"}]}},"PricingPage":{"dependencies":[{"argName":"clientRouter","name":"ClientRouter"}],"init":true,"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]},{"c":"currentUrl","t":"a","h":[{"e":1,"code":"_component.currentUrl","subs":["this.currentUrl"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":" <i class=\\"lni lni-save\\"><\\\/i> ","t":"m"},{"c":"\\n        ","t":"x"},{"c":" ","t":"m"},{"t":"m","e":1,"code":"_component.currentUrl","subs":["this.currentUrl"]},{"c":" ","t":"m"},{"c":"\\n        ","t":"x"},{"c":" <div if=\\"1==2\\">Active<\\\/div> ","t":"m"},{"c":"\\n        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"max-w-screen-xl mx-auto "}]}],"h":[{"c":"\\n            ","t":"x"},{"c":"section","t":"t","a":[{"c":"class","t":"a","h":[{"c":"bg-white dark:bg-gray-900"}]}],"h":[{"c":"\\n                ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6"}]}],"h":[{"c":"\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mx-auto max-w-screen-md text-center mb-8 lg:mb-12"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":"h2","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white"}]}],"h":[{"c":"Designed for business teams like yours","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400"}]}],"h":[{"c":"Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0"}]}],"h":[{"c":"\\n                        ","t":"x"},{"c":" Pricing Card ","t":"m"},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-2xl font-semibold"}]}],"h":[{"c":"Starter","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-light text-gray-500 sm:text-lg dark:text-gray-400"}]}],"h":[{"c":"Best option for personal use & for your next project.","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-baseline my-8"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mr-2 text-5xl font-extrabold"}]}],"h":[{"c":"29","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"\\\/month","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":" List ","t":"m"},{"c":"\\n                            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"role","t":"a","h":[{"c":"list"}]},{"c":"class","t":"a","h":[{"c":"mb-8 space-y-4 text-left"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Individual configuration","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"No setup, or hidden fees","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Team size: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"1 developer","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Premium support: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"6 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Free updates: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"6 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900"}]}],"h":[{"c":"Get started","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":" Pricing Card ","t":"m"},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-2xl font-semibold"}]}],"h":[{"c":"Company","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-light text-gray-500 sm:text-lg dark:text-gray-400"}]}],"h":[{"c":"Relevant for multiple users, extended & premium support.","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-baseline my-8"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mr-2 text-5xl font-extrabold"}]}],"h":[{"c":"9","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]},{"c":"dark:text-gray-400","t":"a"}],"h":[{"c":"\\\/month","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":" List ","t":"m"},{"c":"\\n                            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"role","t":"a","h":[{"c":"list"}]},{"c":"class","t":"a","h":[{"c":"mb-8 space-y-4 text-left"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Individual configuration","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"No setup, or hidden fees","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Team size: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"10 developers","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Premium support: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"24 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Free updates: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"24 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900"}]}],"h":[{"c":"Get started","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                        ","t":"x"},{"c":" Pricing Card ","t":"m"},{"c":"\\n                        ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white"}]}],"h":[{"c":"\\n                            ","t":"x"},{"c":"h3","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mb-4 text-2xl font-semibold"}]}],"h":[{"c":"Enterprise","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"p","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-light text-gray-500 sm:text-lg dark:text-gray-400"}]}],"h":[{"c":"Best for large scale uses and extended redistribution rights.","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex justify-center items-baseline my-8"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"mr-2 text-5xl font-extrabold"}]}],"h":[{"c":"499","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"text-gray-500 dark:text-gray-400"}]}],"h":[{"c":"\\\/month","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":" List ","t":"m"},{"c":"\\n                            ","t":"x"},{"c":"ul","t":"t","a":[{"c":"role","t":"a","h":[{"c":"list"}]},{"c":"class","t":"a","h":[{"c":"mb-8 space-y-4 text-left"}]}],"h":[{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Individual configuration","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"No setup, or hidden fees","t":"x"}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Team size: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"100+ developers","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Premium support: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"36 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                                ","t":"x"},{"c":"li","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex items-center space-x-3"}]}],"h":[{"c":"\\n                                    ","t":"x"},{"c":" Icon ","t":"m"},{"c":"\\n                                    ","t":"x"},{"c":"svg","t":"t","a":[{"c":"class","t":"a","h":[{"c":"flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"}]},{"c":"fill","t":"a","h":[{"c":"currentColor"}]},{"c":"viewBox","t":"a","h":[{"c":"0 0 20 20"}]},{"c":"xmlns","t":"a","h":[{"c":"http:\\\/\\\/www.w3.org\\\/2000\\\/svg"}]}],"h":[{"c":"path","t":"t","a":[{"c":"fill-rule","t":"a","h":[{"c":"evenodd"}]},{"c":"d","t":"a","h":[{"c":"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"}]},{"c":"clip-rule","t":"a","h":[{"c":"evenodd"}]}]}]},{"c":"\\n                                    ","t":"x"},{"c":"span","t":"t","h":[{"c":"Free updates: ","t":"x"},{"c":"span","t":"t","a":[{"c":"class","t":"a","h":[{"c":"font-semibold"}]}],"h":[{"c":"36 months","t":"x"}]}]},{"c":"\\n                                ","t":"x"}]},{"c":"\\n                            ","t":"x"}]},{"c":"\\n                            ","t":"x"},{"c":"a","t":"t","a":[{"c":"href","t":"a","h":[{"c":"#"}]},{"c":"class","t":"a","h":[{"c":"text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900"}]}],"h":[{"c":"Get started","t":"x"}]},{"c":"\\n                        ","t":"x"}]},{"c":"\\n                    ","t":"x"}]},{"c":"\\n                ","t":"x"}]},{"c":"\\n            ","t":"x"}]},{"c":"\\n        ","t":"x"}]},{"c":"\\n    ","t":"x"}]},{"c":"  \\n","t":"x"}]}]}},"ServicesPage":{"nodes":{"c":null,"t":"r","h":[{"c":"PublicLayout","t":"c","a":[{"c":"title","t":"a","h":[{"e":1,"code":"_component.title","subs":["this.title"]}]}],"h":[{"c":"\\n    ","t":"x"},{"c":"div","t":"t","a":[{"c":"class","t":"a","h":[{"c":"p-4"}]}],"h":[{"c":"\\n        ","t":"x"},{"c":" <i class=\\"lni lni-save\\"><\\\/i> ","t":"m"},{"c":"\\n        \\n    ","t":"x"}]},{"c":"  \\n","t":"x"}]}]}},"ViewiScripts":{"dependencies":[{"argName":"httpClient","name":"HttpClient"},{"argName":"asyncStateManager","name":"AsyncStateManager"}],"nodes":{"c":null,"t":"r","h":[{"t":"x","e":1,"raw":1,"code":"_component.getDataScript()","subs":["this.getDataScript()","this.responses"]},{"c":"\\r\\n","t":"x"},{"c":"<script defer src=\\"\\\/viewi-build\\\/app.js\\"><\\\/script>","t":"x","raw":1}]}},"Features":{"service":true},"CssBundle":{"hasVersions":true,"versions":{"\\\/viewi-app\\\/assets\\\/static\\\/css\\\/main.css0000":{"c":null,"t":"r","h":[{"c":"<link rel=\\"stylesheet\\" href=\\"\\\/viewi-app\\\/assets\\\/static\\\/css\\\/main.css\\">","t":"x","raw":1}]}}},"_meta":{"tags":"html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,linearGradient,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,stop,textarea,polygon,polyline,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot,svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,rect,switch,symbol,text,textpath,tspan,use,view,template,slot,slotContent","boolean":"async,autofocus,autoplay,checked,controls,default,defer,disabled,formnovalidate,hidden,ismap,itemscope,loop,multiple,muted,nomodule,novalidate,open,readonly,required,reversed,selected"},"_startups":[],"_routes":[{"url":"\\\/signin","method":"get","component":"SignInPage","defaults":null,"wheres":[]},{"url":"\\\/signup","method":"get","component":"SignUpPage","defaults":null,"wheres":[]},{"url":"\\\/forgot-password","method":"get","component":"ForgotPasswordPage","defaults":null,"wheres":[]},{"url":"\\\/","method":"get","component":"HomePage","defaults":null,"wheres":[]},{"url":"\\\/features","method":"get","component":"FeaturesPage","defaults":null,"wheres":[]},{"url":"\\\/pricing","method":"get","component":"PricingPage","defaults":null,"wheres":[]},{"url":"\\\/services","method":"get","component":"ServicesPage","defaults":null,"wheres":[]},{"url":"\\\/hardware","method":"get","component":"HardwarePage","defaults":null,"wheres":[]},{"url":"\\\/contact","method":"get","component":"ContactPage","defaults":null,"wheres":[]},{"url":"*","method":"get","component":"NotFoundPage","defaults":null,"wheres":[]}],"_config":null}';

var VIEWI_PATH = "/viewi-build";
var VIEWI_VERSION = "";

(function (exports, bring) {
    function OnReady(func) {
        var $this = this;
        this.action = func;
        this.then = function (onOk, onError) {
            this.onOk = onOk;
            this.onError = onError;
            this.action(function (data) {
                $this.onOk(data);
            }, function (data) {
                $this.onError(data);
            }
            );
        };
        this.catch = function (onError) {
            this.onError = onError;
        };
    }
    function isFile(data) {
        if ('File' in window && data instanceof File)
            return true;
        else return false;
    }

    function isBlob(data) {
        if ('Blob' in window && data instanceof Blob)
            return true;
        else return false;
    }
    var ajax = {
        request: function (type, url, data, options) {
            return new OnReady(function (onOk, onError) {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (req.readyState === 4) {
                        var status = req.status;
                        var contentType = req.getResponseHeader("Content-Type");
                        var itsJson = contentType && contentType.indexOf('application/json') === 0;
                        var content = req.responseText;
                        if (itsJson) {
                            content = JSON.parse(req.responseText);
                        }
                        if (status === 0 || (status >= 200 && status < 400)) {
                            onOk(content);
                        } else {
                            onError(content);
                        }
                    }
                }
                var isJson = data !== null && typeof data === 'object' && !isBlob(data);
                req.open(type.toUpperCase(), url, true);
                if (isJson) {
                    req.setRequestHeader('Content-Type', 'application/json');
                }
                if (options && options.headers) {
                    for (var h in options.headers) {
                        req.setRequestHeader(h, options.headers[h]);
                    }
                }
                data !== null ?
                    req.send(isJson ? JSON.stringify(data) : data)
                    : req.send();
            });
        },
        get: function (url, options) {
            return ajax.request('GET', url, null, options);
        },
        post: function (url, data, options) {
            return ajax.request('POST', url, data, options);
        },
        put: function (url, data, options) {
            return ajax.request('PUT', url, data, options);
        },
        delete: function (url, data, options) {
            return ajax.request('DELETE', url, data, options);
        }
    };
    exports.OnReady = OnReady;
    exports.ajax = ajax;
})(viewiExports, viewiBring);
Object.defineProperty(Array.prototype, 'first', {
    enumerable: false,
    value: function (x, g) {
        for (var k in this) {
            if (x) {
                if (x(this[k], k)) {
                    if (g) {
                        return [
                            this[k],
                            k
                        ];
                    }
                    return this[k];
                }
            } else {
                return this[k];
            }
        }
        return null;
    }
});
Object.defineProperty(Array.prototype, 'where', {
    enumerable: false,
    value: function (x) {
        var result = [];
        for (var k in this) {
            if (x(this[k], k)) {
                result.push(this[k]);
            }
        }
        return result;
    }
});
Object.defineProperty(Array.prototype, 'select', {
    enumerable: false,
    value: function (x) {
        var result = [];
        for (var k in this) {
            result.push(x(this[k], k));
        }
        return result;
    }
});
Object.defineProperty(Array.prototype, 'each', {
    enumerable: false,
    value: function (x) {
        for (var k in this) {
            x(this[k], k);
        }
        return this;
    }
});
(function (exports, bring) {
    var noRouter = viewiGlobal.VIEWI_NO_ROUTER;
    var Router = noRouter ? null : bring('Router');
    var ajax = bring('ajax');

    function Viewi() {
        var $this = this;
        var availableTags = {};
        var booleanAttributes = {};
        var resourceTags = {};
        var trimExpr = /^\s*|\s*$/g;
        var trimSemicolonExpr = /;$/g;
        var events = {
            onViewiUrlChange: null
        };
        'img,embed,object,link,script,audio,video,style'
            .split(',')
            .each(function (t) {
                resourceTags[t] = true;
            });

        var resourcesCache = [];
        var alternatives = 'a,';
        var svgMap = {
            svg: true
        };
        // 'altGlyph,altGlyphDef,altGlyphItem,animate,animateMotion,animateTransform,circle'
        // +',clipPath,cursor,defs,desc,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix'
        // +',feDiffuseLighting,feDisplacementMap,feDistantLight,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,'
        // +'feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,'
        // +'feTurbulence,filter,font,font-face,font-face-format,font-face-name,font-face-src,font-face-uri,foreignObject,g,glyph,glyphRef,hkern,image,line,linearGradient,marker,mask,metadata,missing-glyph,mpath,path,pattern,polygon,polyline,radialGradient,rect,script,set,stop,style,svg,switch,symbol,text,textPath,title,tref,tspan,use,view'
        // .split(',')
        var router = noRouter ? null : new Router();
        this.componentsUrl = VIEWI_PATH + '/components.json' + VIEWI_VERSION;
        this.components = {};
        var htmlElementA = document.createElement('a');
        var hydrate = false;
        var config = null;
        var scrollTo = null;
        var started = false;
        var startInProgress = false;
        var onStartQueue = [];

        var getPathName = function (href) {
            htmlElementA.href = href;
            return htmlElementA.pathname;
        };

        var cacheResources = function () {
            for (var tag in resourceTags) {
                var elements = document.getElementsByTagName(tag);
                for (var i = 0; i < elements.length; i++) {
                    resourcesCache.push(elements[i]);
                }
            }
        }

        var startInternal = function () {
            $this.components._meta.tags.split(',').each(function (x) {
                availableTags[x] = true;
            });
            $this.components._meta.boolean.split(',').each(function (x) {
                booleanAttributes[x] = true;
            });
            !noRouter && $this.components._routes.each(function (x) {
                router.register(x.method, x.url, x.component);
            });
            config = $this.components._config;
            cacheResources();
            hydrate = true;
            // start up
            for (var s in $this.components._startups) {
                var name = $this.components._startups[s];
                try {
                    var startUp = resolve(name);
                    startUp.setUp();
                } catch (err) {
                    console.error('Start up error in component ' + name, err);
                }
            }
            started = true;
            for (var onStartCallbackIndex in onStartQueue) {
                onStartQueue[onStartCallbackIndex]();
            }
            if (!noRouter) {
                $this.go(location.href, false);
            }
        };

        this.getConfig = function () {
            return config;
        }

        this.start = function (callback) {
            if (callback) {
                onStartQueue.push(callback);
            }
            if (started || startInProgress) {
                return;
            }
            startInProgress = true;
            if (typeof onViewiUrlChange !== 'undefined'
                && typeof onViewiUrlChange === 'function') {
                events.onViewiUrlChange = onViewiUrlChange;
            }
            if (typeof ViewiPages !== 'undefined') {
                $this.components = JSON.parse(ViewiPages);
                startInternal();
            } else {
                ajax.get(this.componentsUrl)
                    .then(function (components) {
                        $this.components = components;
                        startInternal();
                    });
            }

            if (!noRouter) {
                // catch all local A tags click
                document.addEventListener('click', function (e) {
                    e = e || window.event;
                    if (e.defaultPrevented) {
                        return;
                    }
                    var target = e.target || e.srcElement;
                    var aTarget = target;
                    while (aTarget.parentNode && aTarget.tagName !== 'A') {
                        aTarget = aTarget.parentNode;
                    }
                    if (aTarget.tagName === 'A' && aTarget.href && aTarget.href.indexOf(location.origin) === 0) {
                        scrollTo = null;
                        getPathName(aTarget.href);
                        if (
                            !htmlElementA.hash
                            || htmlElementA.pathname !== location.pathname
                        ) {
                            e.preventDefault(); // Cancel the native event
                            // e.stopPropagation(); // Don't bubble/capture the event
                            if (htmlElementA.hash) {
                                scrollTo = htmlElementA.hash;
                            }
                            $this.go(aTarget.href, true);
                        }
                    }
                }, false);

                // handle back button
                window.addEventListener('popstate', function (e) {
                    if (e.state)
                        $this.go(e.state.href, false);
                    else
                        $this.go(location.href, false);
                });
            }
        };

        this.go = function (href, isForward) {
            var url = getPathName(href);
            events.onViewiUrlChange && events.onViewiUrlChange(url);
            var routeItem = router.resolve(url);
            if (routeItem == null) {
                throw 'Can\'t resolve route for uri: ' + url;
            }
            if (isForward) {
                window.history.pushState({ href: href }, '', href);
            }
            $this.render(routeItem.item.action, routeItem.params);
        };

        var currentComponent = null;
        var currentScope = [];

        var getDataExpression = function (item, instance) {
            // Function.apply(null, ['a', 'return a;'])
            var itsEvent = arguments.length > 2 && arguments[2];
            var forceRaw = arguments.length > 3 && arguments[3];
            if (item.expression) {
                var contentExpression = {
                    call: true,
                    instance: instance
                };
                var args = ['_component', 'app'];
                if (item.model) {
                    args.push('value');
                }
                if (itsEvent || item.setter) {
                    args.push('event');
                }
                if (item.scope) {
                    args = args.concat(item.scope.stack);
                } else {
                    args = args.concat(currentScope);
                }
                item.code = item.code.replace(trimExpr, '');
                item.code = item.code.replace(trimSemicolonExpr, '');
                if (item.setter) {
                    args.push(
                        item.isChecked ?
                            'if(Array.isArray(' + item.code + ')) { \n'
                            + '    var notify = viewiBring("notify");\n'
                            + ' if (' + item.code + '.indexOf(event.target.value) === -1) { \n'
                            + 'event.target.checked && ' + item.code + '.push(event.target.value);\n'
                            + 'event.target.checked && notify(' + item.code + '); \n'
                            + ' } else { '
                            + '!event.target.checked && ' + item.code + '.splice(' + item.code + '.indexOf(event.target.value), 1);\n'
                            + '!event.target.checked && notify(' + item.code + '); \n'
                            + ' } \n'
                            + ' } else { \n'
                            + item.code + ' = event.target.checked;\n'
                            + ' } '
                            : (item.code + ' = event.target.multiple ? Array.prototype.slice.call(event.target.options)\n'
                                + '.where(function(x){ return x.selected; })\n'
                                + '.select(function(x){ return x.value; })\n'
                                + ' : event.target.value;')

                    );
                } else if (item.model) {
                    args.push(item.code + ' = value;');
                }
                // else if (item.raw || forceRaw) {
                else {
                    args.push('return ' + item.code + ';');
                }
                // } else {
                //     args.push('return app.htmlentities(' + item.code + ');');
                // }
                contentExpression.code = item.code;
                contentExpression.func = Function.apply(null, args);
                return contentExpression;
            }
            return { call: false, content: item.content };
        }

        var specialTags = ['template'];
        var specialTypes = ['if', 'else-if', 'else', 'foreach'];
        var conditionalTypes = ['if', 'else-if', 'else'];
        var requirePreviousIfTypes = ['else-if', 'else'];
        var usedSpecialTypes = [];

        var unpack = function (item) {
            var nodeType = '';
            switch (item.t) {
                case 't': {
                    nodeType = 'tag';
                    break;
                }
                case 'a': {
                    nodeType = 'attr';
                    break;
                }
                case undefined:
                case 'v': {
                    nodeType = 'value';
                    break;
                }
                case 'c': {
                    nodeType = 'component';
                    break;
                }
                case 'x': {
                    nodeType = 'text';
                    break;
                }
                case 'm': {
                    nodeType = 'comment';
                    break;
                }
                default:
                    throw new Error("Type " + item.t + " is not defined in build");
            }
            item.type = nodeType;
            delete item.t;
            item.content = item.c;
            delete item.c;
            if (item.e) {
                item.expression = item.e;
                delete item.e;
            }
            if (item.a) {
                item.attributes = item.a;
                delete item.a;
            }
            if (item.h) {
                item.children = item.h;
                delete item.h;
            };
        }

        var build = function (parent, instance, stack, owner, level) {
            var parentNode = owner && !owner.isRoot ? owner : null;
            var isRoot = instance.isRoot;
            !level && (level = 0);
            parent.h && !parent.children && (parent.children = parent.h);
            var children = parent.children;
            var currentNodeList = [];
            var skip = false;
            var node = false;
            var previousNode = null;
            var usedSubscriptions = {};
            for (var i in children) {
                var item = children[i];
                if (!item.unpacked) {
                    unpack(item);
                    if (item.attributes) {
                        for (var i = 0; i < item.attributes.length; i++) {
                            var currentAttribute = item.attributes[i];
                            unpack(currentAttribute);
                            if (currentAttribute.children) {
                                for (var j = 0; j < currentAttribute.children.length; j++) {
                                    unpack(currentAttribute.children[j]);
                                }
                            }
                        }
                    }
                    item.unpacked = true;
                }
                if (item.type === 'tag' && item.content === 'slot') {
                    skip = true;
                    var slotNameItem = item.attributes && item.attributes.first(function (x) { return x.content === 'name'; });
                    var slotName = 0;
                    var slotNameExpression = function (x) {
                        return !x.attributes;
                    };
                    if (slotNameItem) {
                        slotName = slotNameItem.children[0].content;
                        slotNameExpression = function (x) {
                            return x.attributes
                                && x.attributes.first(function (y) {
                                    return y.content === 'name'
                                        && y.children[0].content === slotName;
                                });
                        }
                    }
                    var useDefault = true;
                    if (stack) {
                        if (slotName === 0) {
                            var items = stack.where(function (x) {
                                return x.type !== 'tag' || x.contents[0].content !== 'slotContent';
                            });
                            if (items.length > 0) {
                                useDefault = false;
                                // reassign parent
                                var prevNode = currentNodeList.length > 0
                                    ? currentNodeList[currentNodeList.length - 1]
                                    : null;
                                var toConcat = [];
                                items.each(function (x) {
                                    if (prevNode
                                        && prevNode.type === 'text'
                                        && x.type === 'text'
                                        && !x.raw
                                        && !prevNode.raw
                                        && !x.contents[0].func
                                    ) {
                                        prevNode.contents = prevNode.contents.concat(x.contents);
                                    } else {
                                        x.nextNode = null;
                                        x.parent = parentNode;
                                        x.previousNode = prevNode;
                                        if (prevNode) {
                                            prevNode.nextNode = x;
                                        }
                                        prevNode = x;
                                        toConcat.push(x);
                                    }
                                });
                                currentNodeList = currentNodeList.concat(toConcat);
                            }
                        } else {
                            var slotContent = stack.first(function (x) {
                                return x.type === 'tag'
                                    && x.contents[0].content === 'slotContent'
                                    && slotNameExpression(x);
                            });
                            if (slotContent) {
                                useDefault = false;
                                // reassign parent
                                var prevNode = currentNodeList.length > 0
                                    ? currentNodeList[currentNodeList.length - 1]
                                    : null;
                                var toConcat = [];
                                slotContent.children.each(function (x) {
                                    if (prevNode
                                        && prevNode.type === 'text'
                                        && x.type === 'text'
                                        && !x.raw
                                        && !prevNode.raw
                                        && !x.contents[0].func
                                    ) {
                                        prevNode.contents = prevNode.contents.concat(x.contents);
                                    } else {
                                        x.nextNode = null;
                                        x.parent = parentNode;
                                        x.previousNode = prevNode;
                                        if (prevNode) {
                                            prevNode.nextNode = x;
                                        }
                                        prevNode = x;
                                        toConcat.push(x);
                                    }
                                });
                                currentNodeList = currentNodeList.concat(toConcat);
                            }
                        }
                        previousNode = currentNodeList.length > 0
                            ? currentNodeList[currentNodeList.length - 1]
                            : null;
                    }
                    if (useDefault) {
                        // unnamed slot
                        var defaultContent = build(item, instance, false, parentNode, level);
                        // reassign parent
                        var prevNode = currentNodeList.length > 0
                            ? currentNodeList[currentNodeList.length - 1]
                            : null;
                        var toConcat = [];
                        defaultContent.each(function (x) {
                            if (prevNode
                                && prevNode.type === 'text'
                                && x.type === 'text'
                                && !x.raw
                                && !prevNode.raw
                                && !x.contents[0].func
                            ) {
                                prevNode.contents = prevNode.contents.concat(x.contents);
                            } else {
                                x.nextNode = null;
                                x.parent = parentNode;
                                x.previousNode = prevNode;
                                if (prevNode) {
                                    prevNode.nextNode = x;
                                }
                                prevNode = x;
                                toConcat.push(x);
                            }
                        });
                        currentNodeList = currentNodeList.concat(toConcat);
                        previousNode = currentNodeList.length > 0
                            ? currentNodeList[currentNodeList.length - 1]
                            : null;
                    }
                    continue;
                }

                if (!item.raw && node && ((item.type === 'text' && node.type === 'text')
                    || (item.type === 'comment' && node.type === 'comment'))
                ) {
                    node.contents.push(getDataExpression(item, instance));
                    if (item.subs) {
                        node.subs = (node.subs || []).concat(item.subs);
                    }
                    continue;
                }
                var specialType = null;
                if (item.attributes) {
                    specialType = item.attributes.first(function (a) {
                        return specialTypes.indexOf(a.content) !== -1 && usedSpecialTypes.indexOf(a.content) === -1;
                    });
                    //.select(function (a) { return a.content; }).first();
                }
                var component = false;
                node = {
                    id: ++nextNodeId,
                    type: item.type,
                    contents: [getDataExpression(item, instance)],
                    domNode: null, // DOM node if rendered
                    parent: parentNode, // TODO: make immutable
                    instance: instance,
                    previousNode: previousNode,
                    subs: item.subs
                };
                if (item.raw) {
                    node.type = 'raw';
                    node.isVirtual = true;
                }
                if (parentNode && parentNode.condition) {
                    node.condition = parentNode.condition;
                }
                if (previousNode) {
                    previousNode.nextNode = node;
                }
                previousNode = node;
                if (item.type === 'tag' && item.expression) {
                    node.type = 'dynamic';
                    node.componentChildren = item.children;
                    node.isVirtual = true;
                }
                if (specialType === null && item.type === 'tag' && specialTags.indexOf(item.content) !== -1) {
                    var specialTag = item.content;
                    node.type = specialTag;
                    node.isVirtual = true;
                }
                if (parentNode && parentNode.scope) {
                    node.scope = parentNode.scope;
                }
                if (specialType !== null) {
                    node.type = specialType.content;
                    if (node.type === 'if') { // reset group
                        usedSubscriptions = {};
                    }
                    node.isVirtual = true;
                    usedSpecialTypes.push(specialType.content);
                    if (conditionalTypes.indexOf(node.type) !== -1) {
                        node.condition = specialType.children
                            ? getDataExpression(specialType.children[0], instance)
                            : {};
                        if (specialType.children && specialType.children[0].subs) { // TODO: subscribe all if-else group to each sub changes
                            node.subs = specialType.children[0].subs;
                            for (var s in specialType.children[0].subs) {
                                usedSubscriptions[specialType.children[0].subs[s]] = true;
                            }
                        }
                    }
                    var codeChild = false;
                    if (node.type === 'foreach') {
                        // compile foreach expression
                        if (specialType.children) {
                            codeChild = specialType.children[0];
                            if (codeChild.subs) {
                                node.subs = (node.subs || []).concat(codeChild.subs);
                            }
                            node.forExpression = {};
                            var arguments = ['_component', 'app'].concat(currentScope);
                            arguments.push('return ' + codeChild.forData + ';');
                            node.forExpression.data = Function.apply(null, arguments);
                            node.forExpression.key = codeChild.forKey;
                            node.forExpression.value = codeChild.forItem;
                            currentScope.push(codeChild.forKey);
                            currentScope.push(codeChild.forItem);
                            node.scope = {
                                stack: [], //currentScope.slice(),
                                data: {}
                            }
                            // console.log(node, node.forExpression, currentScope);
                        }
                    }
                    node.children = build({ children: [item] }, instance, stack, node, level + 1);
                    if (node.childInstances) {
                        node.children[0].childInstances = node.childInstances;
                        delete node.childInstances;
                    }
                    // reset currentScope
                    if (codeChild) {
                        // remove from currentScope
                        var remIn = currentScope.indexOf(codeChild.forKey);
                        if (remIn > -1) {
                            currentScope.splice(remIn, 1);
                        }
                        remIn = currentScope.indexOf(codeChild.forItem);
                        if (remIn > -1) {
                            currentScope.splice(remIn, 1);
                        }
                    }

                    currentNodeList.push(node);
                    // TODO: subscribe
                    // TODO: create check function
                    continue;
                } else if (usedSpecialTypes.length > 0) {
                    usedSpecialTypes = [];
                }
                if (item.type === 'component') {
                    component = item.content;
                }
                // children
                childNodes = false;
                if (item.children) {
                    childNodes = build(item, instance, stack, node, level + 1);
                }
                if (item.attributes) {
                    node.attributes = item.attributes
                        .where(function (a) {
                            return specialTypes.indexOf(a.content) === -1;
                        })
                        .select(
                            function (a) {
                                var copy = {};
                                var itsEvent = a.expression ? false : a.content[0] === '(';
                                copy.content = a.content; // keep it for slots
                                copy.isAttribute = true;
                                copy.parent = node;
                                copy.contentExpression = getDataExpression(a, instance);
                                copy.instance = node.instance;
                                if (a.dynamic) {
                                    copy.dynamic = a.dynamic;
                                }
                                if (node.scope) {
                                    copy.scope = node.scope;
                                }
                                if (a.children) {
                                    copy.children = a.children.select(
                                        function (v) {
                                            var valCopy = {};
                                            var forceRaw = a.content === 'model';
                                            valCopy.contentExpression = getDataExpression(v, instance, itsEvent, forceRaw);
                                            if (node.type === 'dynamic'
                                                || node.type === 'component'
                                            ) { // we need props
                                                valCopy.propExpression = getDataExpression(v, instance, null, true);
                                                if (v.subs) {
                                                    valCopy.subs = v.subs;
                                                }
                                            }

                                            valCopy.content = v.content; // keep it for slots
                                            if (v.subs && !itsEvent) {
                                                valCopy.subs = (valCopy.subs || []).concat(v.subs);
                                            }
                                            return valCopy;
                                        }
                                    );
                                }
                                if (a.subs && !itsEvent) {
                                    copy.subs = (copy.subs || []).concat(a.subs);
                                }
                                copy.origin = a;
                                return copy;
                            }
                        );
                }
                if (component) {
                    // compare component and reuse if matched
                    // if reused refresh slots
                    var resetReuse = false;
                    if (isRoot) {
                        reuseEnabled = true;
                        resetReuse = true;
                        if (childNodes) {
                            for (var chI = 0; chI < childNodes.length; chI++) {
                                childNodes[chI].rootPage = true;
                            }
                        }
                    }
                    var componentNodes = create(component, childNodes, node.attributes, false, false, { level: level, parentInstance: instance });
                    if (!owner.childInstances) {
                        owner.childInstances = [];
                    }
                    owner.childInstances.push(componentNodes);
                    if (resetReuse) {
                        reuseEnabled = false;
                    }

                    var currentVersion = 'main';
                    if (componentNodes.wrapper.hasVersions) {
                        createInstance(componentNodes.wrapper);
                        mountInstance(componentNodes.wrapper);
                        currentVersion = componentNodes.wrapper
                            && componentNodes.wrapper.component.__version
                            && componentNodes.wrapper.component.__version();
                        if (!currentVersion) {
                            throw new Error("Component '" + componentNodes.wrapper.name + "' doesn't support versioning!");
                        }
                    }
                    if (!(currentVersion in componentNodes.versions)) {
                        throw new Error("Can't find version '" + currentVersion + "' for component '" + componentNodes.wrapper.name + "'!");
                    }

                    var prevNode = currentNodeList.length > 0
                        ? currentNodeList[currentNodeList.length - 1]
                        : null;
                    var toConcat = [];
                    componentNodes.versions[currentVersion].each(function (x) {
                        if (prevNode
                            && prevNode.type === 'text'
                            && x.type === 'text'
                            && !x.raw
                            && !prevNode.raw
                        ) {
                            prevNode.contents = prevNode.contents.concat(x.contents);
                        } else {
                            x.nextNode = null;
                            x.parent = parentNode;
                            x.previousNode = prevNode;
                            if (prevNode) {
                                prevNode.nextNode = x;
                            }
                            prevNode = x;
                            toConcat.push(x);
                        }
                    });
                    currentNodeList = currentNodeList.concat(toConcat);

                    previousNode = currentNodeList.length > 0
                        ? currentNodeList[currentNodeList.length - 1]
                        : null;
                    // if (currentNodeList.length > 0
                    //     && componentNodes.length > 0) {
                    //     componentNodes[0].previousNode = currentNodeList[currentNodeList.length - 1];
                    //     currentNodeList[currentNodeList.length - 1].nextNode = componentNodes[0];
                    // }
                    // currentNodeList = currentNodeList.concat(componentNodes);
                    // getting component._slots
                    // children[0].children lookup for slotContent
                    // instance componentNodes.wrapper
                    var _slots = {};
                    var componentChildren = children[0].children;
                    if (componentChildren) {
                        for (var nodeI in componentChildren) {
                            var childNode = componentChildren[nodeI];
                            if (
                                childNode.type === 'tag'
                                && childNode.content === 'slotContent'
                            ) {
                                var slotName = childNode.attributes
                                    && childNode.attributes.first(function (y) {
                                        return y.content === 'name'
                                            && y.children[0].content;
                                    }).children[0].content;
                                _slots[slotName] = true;
                            } else {
                                _slots[0] = true;
                            }
                        }
                    }
                    componentNodes.wrapper._slots = _slots;
                    // console.log(['build component', _slots, component, instance, children, componentNodes, stack, componentNodes.wrapper.instance, componentNodes.wrapper]);

                } else {
                    if (childNodes) {
                        if (node.type === 'dynamic' || node.type === 'raw') {
                            node.itemChildren = childNodes;
                        } else {
                            node.children = childNodes;
                        }
                    }
                    currentNodeList.push(node);
                }
            }
            return currentNodeList;
        };

        var subscribeProps = function (wrapper) {
            if (wrapper.attributes) {
                for (var i = 0; i < wrapper.attributes.length; i++) {
                    var attribute = wrapper.attributes[i];
                    var itsEvent = attribute.expression ? false : attribute.content[0] === '(';
                    attribute.childComponent = wrapper.component;
                    if (!itsEvent) {
                        if (attribute.subs) {
                            for (var s in attribute.subs) {
                                listenTo(attribute, attribute.subs[s]);
                            }
                        }
                        if (attribute.children) {
                            for (var acI = 0; acI < attribute.children.length; acI++) {
                                var attributeChild = attribute.children[acI];
                                if (attributeChild.subs) {
                                    for (var s in attributeChild.subs) {
                                        listenTo(attribute, attributeChild.subs[s]);
                                        // console.log(['listen', attribute.content, attribute, wrapper, component]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        var mountInstance = function (wrapper) {
            if (wrapper.isMounted) return;
            wrapper.component.__beforeMount && wrapper.component.__beforeMount();
            subscribeProps(wrapper);
            if (wrapper.attributes) {
                for (var ai in wrapper.attributes) {
                    var attr = wrapper.attributes[ai];
                    // TODO: DRY (attribute event)
                    var itsEvent = attr.content[0] === '(';
                    var eventName = null;
                    if (itsEvent) { // event emitter
                        var attrName = attr.content;
                        eventName = attrName.substring(1, attrName.length - 1);
                        var actionContent = null;
                        if (attr.dynamic) { // ex: <button $clickEvent="onClick()"></button>
                            if (!attr.eventExpression) {
                                if (!attr.instance.component) {
                                    attr.instance.component = createInstance(attr.instance);
                                }
                                attr.eventExpression = getDataExpression(attr.dynamic, attr.instance, true);
                                // console.log(attr.eventExpression);
                            }
                            actionContent = attr.eventExpression.func;
                        } else {
                            actionContent = attr.children[0].contentExpression.func;
                        }
                        if (!attr.listeners) {
                            attr.listeners = {};
                        }
                        attr.listeners[attrName] && elm.removeEventListener(eventName, attr.listeners[attrName]);
                        attr.listeners[attrName] = function ($event) {
                            //actionContent(attr.instance.component, $this, $event);
                            var args = [attr.instance.component, $this, $event];
                            if (attr.scope) {
                                for (var k in attr.scope.stack) {
                                    args.push(attr.scope.data[attr.scope.stack[k]]);
                                }
                            }
                            actionContent.apply(null, args);
                        };
                        if (!wrapper.component.$_callbacks) {
                            wrapper.component.$_callbacks = {};
                        }
                        wrapper.component.$_callbacks[eventName] = attr.listeners[attrName];
                    }
                    var propValue = null;
                    var currentValue = null;
                    for (var i in attr.children) {
                        var propExpression = attr.children[i].propExpression;
                        if (propExpression.call) {
                            if (!attr.instance.component) {
                                attr.instance.component = createInstance(attr.instance);
                                mountInstance(attr.instance); // also - mount
                            }
                            var args = [attr.instance.component, $this];
                            if (attr.scope) {
                                for (var k in attr.scope.stack) {
                                    args.push(attr.scope.data[attr.scope.stack[k]]);
                                }
                            }
                            currentValue = itsEvent ? wrapper.component.$_callbacks[eventName] : propExpression.func.apply(null, args);
                            if (attr.children[i].subs) {
                                // TODO: investigate
                                // propsSubs['this.' + attr.content] = {
                                //     instance: attr.instance,
                                //     subs: attr.children[i].subs
                                // };
                            }
                        } else {
                            currentValue = propExpression.content;
                        }
                        if (i > 0) {
                            propValue += currentValue;
                        } else {
                            propValue = currentValue;
                        }
                    }
                    if (attr.content === 'model') {
                        // pass model to the child
                        var firstChild = attr.children[0];
                        if (!firstChild.modelExpression) {
                            firstChild.modelExpression = getDataExpression({
                                code: firstChild.contentExpression.code,
                                expression: true,
                                model: true
                            }, attr.instance);
                        }
                        wrapper.component._model = [firstChild.modelExpression, firstChild.propExpression];
                        wrapper.component['modelValue'] = propValue;
                        // callback for model
                        if (!wrapper.component.$_callbacks) {
                            wrapper.component.$_callbacks = {};
                        }
                        wrapper.component.$_callbacks['model'] = function ($event) {
                            var args = [attr.instance.component, $this, $event];
                            if (attr.scope) {
                                for (var k in attr.scope.stack) {
                                    args.push(attr.scope.data[attr.scope.stack[k]]);
                                }
                            }
                            firstChild.modelExpression.func.apply(null, args);
                        };
                        continue;
                    }
                    if (attr.content === '_props') {
                        // console.log(['passing all props', propValue]);
                        // pass all props
                        for (var propName in propValue) {
                            if (propName in wrapper.component) {
                                wrapper.component[propName] = propValue[propName];
                            }
                            if (propName[0] === '(') {
                                // pass the event
                                var eventName = propName.substring(1, propName.length - 1);
                                if (!wrapper.component.$_callbacks) {
                                    wrapper.component.$_callbacks = {};
                                }
                                wrapper.component.$_callbacks[eventName] = propValue[propName];
                            }
                            wrapper.component._props[propName] = propValue[propName];
                        }
                        continue;
                    }
                    if (propValue === 'true') {
                        propValue = true;
                    } else if (propValue === 'false') {
                        propValue = false;
                    }

                    if (attr.content in wrapper.component) {
                        wrapper.component[attr.content] = propValue;
                        // console.log(['mount', wrapper.name, attr.content, propValue, wrapper]);
                        // if(propValue === undefined) debugger;
                    }
                    wrapper.component._props[attr.content] = propValue;
                }
            }
            // console.log(['mount', wrapper.name, wrapper]);
            wrapper.component.__mounted && wrapper.component.__mounted();
            wrapper.isMounted = true;
        }

        var createInstance = function (wrapper) {
            if (wrapper.component) {
                if (wrapper.attributes) {
                    for (var i = 0; i < wrapper.attributes.length; i++) {
                        wrapper.attributes[i].childComponent = wrapper.component;
                        // console.log([wrapper.attributes[i].content, wrapper.attributes[i].origin.childComponent, wrapper.component, wrapper.attributes[i].origin.childComponent === wrapper.component]);
                    }
                }
                return;
            }
            var component = resolve(wrapper.name, wrapper.params, wrapper.__id);
            wrapper.component = component;
            wrapper.isCreated = true;
            // console.log(['create', wrapper.name, wrapper]);
            // if(wrapper.name === 'Row') debugger;
            onRenderedTracker[wrapper.name + '__' + wrapper.__id] = wrapper; // TODO: wrapper.name -> wrapper.id
            if (wrapper._slots) {
                component._slots = wrapper._slots;
            }
            return component;
        }

        var renderAttribute = function (elm, attr, eventsOnly) {
            if (!elm) {
                return;
            }
            try {
                var attrName = attr.content;
                if (attr.contentExpression.call) {
                    if (!attr.instance.component) {
                        attr.instance.component = createInstance(attr.instance);
                    }
                    var args = [attr.instance.component, $this];
                    if (attr.scope) {
                        for (var k in attr.scope.stack) {
                            args.push(attr.scope.data[attr.scope.stack[k]]);
                        }
                    }
                    attrName = attr.contentExpression.func.apply(null, args);
                    if (attr.latestValue && attr.latestValue !== attrName) {
                        elm.removeAttribute(attr.latestValue);
                        if (attr.listeners && attr.latestValue in attr.listeners) {
                            var eventName = attr.latestValue.substring(1, attr.latestValue.length - 1);
                            elm.removeEventListener(eventName, attr.listeners[attr.latestValue]);
                        }

                    }
                    attr.latestValue = attrName;
                }
                if (attrName[0] === '#') {
                    // ref
                    attr.instance.component._refs[attrName.substring(1)] = elm;
                    return;
                }
                if (attrName[0] === '(') {
                    if (hydrate && !eventsOnly) {
                        return; // no events just yet
                    }
                    var eventName = attrName.substring(1, attrName.length - 1);
                    var actionContent = null;
                    if (attr.dynamic) {
                        if (!attr.eventExpression) {
                            if (!attr.instance.component) {
                                attr.instance.component = createInstance(attr.instance);
                            }
                            attr.eventExpression = getDataExpression(attr.dynamic, attr.instance, true);
                            // console.log(attr.eventExpression);
                        }
                        actionContent = attr.eventExpression.func;
                    } else {
                        actionContent = attr.children[0].contentExpression.func;
                    }
                    if (!attr.listeners) {
                        attr.listeners = {};
                    }
                    attr.listeners[attrName] && elm.removeEventListener(eventName, attr.listeners[attrName]);
                    attr.listeners[attrName] = function ($event) {
                        //actionContent(attr.instance.component, $this, $event);
                        var args = [attr.instance.component, $this, $event];
                        if (attr.scope) {
                            for (var k in attr.scope.stack) {
                                args.push(attr.scope.data[attr.scope.stack[k]]);
                            }
                        }
                        actionContent.apply(null, args);
                    };
                    elm.addEventListener(eventName, attr.listeners[attrName]);
                } else {
                    if (eventsOnly && attrName !== 'model') {
                        return;
                    }
                    if (attr.subs && !attr.subscribed) {
                        for (var s in attr.subs) {
                            listenTo(attr, attr.subs[s]);
                        }
                        attr.subscribed = true;
                    }
                    var boolean = false;
                    var exprValue = true;
                    if (attrName in booleanAttributes) {
                        boolean = true;
                    }
                    var texts = [];
                    for (var i in attr.children) {
                        if (attr.children[i].subs && !attr.children[i].subscribed) {
                            for (var s in attr.children[i].subs) {
                                listenTo(attr, attr.children[i].subs[s]);
                            }
                            attr.children[i].subscribed = true;
                        }
                        var contentExpression = attr.children[i].contentExpression;
                        if (contentExpression.call) {
                            if (!attr.instance.component) {
                                attr.instance.component = createInstance(attr.instance);
                            }
                            var args = [attr.instance.component, $this];
                            if (attr.scope) {
                                for (var k in attr.scope.stack) {
                                    args.push(attr.scope.data[attr.scope.stack[k]]);
                                }
                            }
                            exprValue = contentExpression.func.apply(null, args);
                            texts.push(exprValue);
                        } else {
                            texts.push(contentExpression.content);
                        }
                    }
                    if (boolean) {
                        if (exprValue) {
                            elm.setAttribute(attrName, attrName);
                        } else {
                            elm.removeAttribute(attrName);
                        }
                        return;
                    }
                    var isModel = attrName === 'model';
                    var val = texts.join('');
                    if (!isModel) {
                        if (texts[0] === null) {
                            elm.removeAttribute(attrName);
                        } else {
                            if (elm.getAttribute(attrName) !== val) {
                                elm.setAttribute(attrName, val);
                            }
                        }
                    } else // isModel
                    {
                        if (hydrate && !eventsOnly) {
                            return; // no events just yet
                        }
                        val = texts[0];
                        var parentModelCalle = attr.instance.component._model;
                        if (parentModelCalle) {
                            val = parentModelCalle[1].func.apply(null, [parentModelCalle[1].instance.component, $this]);
                        }
                        var isChecked = elm.getAttribute('type') === 'checkbox';
                        var isRadio = elm.getAttribute('type') === 'radio';
                        var isSelect = elm.tagName === 'SELECT';
                        var isMultiple = isSelect && elm.multiple;
                        var isBoolean = isChecked
                            || isRadio;
                        if (!isBoolean && !isMultiple) {
                            elm.value = val;
                        }
                        if (isRadio) {
                            var hasChecked = elm.checked;
                            if (elm.value !== val && hasChecked) {
                                elm.removeAttribute('checked');
                                elm.checked = false;
                            } else if (elm.value === val && !hasChecked) {
                                elm.setAttribute('checked', 'checked');
                                elm.checked = true;
                            }
                        }
                        var eventName = isBoolean || isSelect ? 'change' : 'input';
                        if (!attr.listeners) {
                            attr.listeners = {};
                        }
                        if (!attr.valueExpression && attr.children.length > 0) {
                            if (!attr.instance.component) {
                                attr.instance.component = createInstance(attr.instance);
                            }
                            var args = [attr.instance.component, $this];
                            var scopeArgs = [];
                            if (attr.scope) {
                                for (var k in attr.scope.stack) {
                                    scopeArgs.push(attr.scope.data[attr.scope.stack[k]]);
                                }
                            }
                            attr.valueExpression = getDataExpression({
                                code: attr.children[0].contentExpression.code,
                                expression: true,
                                setter: true,
                                isChecked: isChecked,
                                isMultiple: isMultiple,
                                scope: attr.scope
                            }, attr.instance);
                            attr.modelValueExpression = getDataExpression({
                                code: attr.children[0].contentExpression.code,
                                expression: true
                            }, attr.instance);
                            attr.modelSetValueExpression = getDataExpression({
                                code: attr.children[0].contentExpression.code,
                                expression: true,
                                model: true
                            }, attr.instance);
                            if (parentModelCalle && !parentModelCalle[2]) { // TODO: make object instead of array
                                parentModelCalle[2] = attr.modelSetValueExpression;
                            }
                            var actionContent = attr.valueExpression.func;
                            var modelValueFunc = attr.modelValueExpression.func;
                            var modelValue = parentModelCalle ? modelValueFunc.apply(null, args) : val;
                            if (isBoolean && Array.isArray(modelValue)) {
                                if (modelValue.indexOf(attr.parent.domNode.value) !== -1) {
                                    attr.parent.domNode.setAttribute('checked', 'checked');
                                    attr.parent.domNode.checked = true;
                                } else {
                                    attr.parent.domNode.removeAttribute('checked');
                                    attr.parent.domNode.checked = false;
                                }
                            }
                            else {
                                attr.modelSetValueExpression.func.apply(null, args.concat([val]).concat(scopeArgs));
                                if (isBoolean) {
                                    if (val) {
                                        attr.parent.domNode.setAttribute('checked', 'checked');
                                        attr.parent.domNode.checked = true;
                                    } else {
                                        attr.parent.domNode.removeAttribute('checked');
                                        attr.parent.domNode.checked = false;
                                    }
                                }
                            }
                            attr.listeners[eventName] = function ($event) {
                                actionContent.apply(null, args.concat([$event]).concat(scopeArgs));
                                if (parentModelCalle) {
                                    var modelValue = modelValueFunc.apply(null, args.concat([$event]).concat(scopeArgs));
                                    parentModelCalle[0].func.apply(null, [parentModelCalle[0].instance.component, $this, modelValue]);
                                }
                            };
                        } else {
                            var modelValueFunc = attr.modelValueExpression.func;
                            var modelValue = parentModelCalle ? modelValueFunc.apply(null, args) : val;
                            if (isBoolean && Array.isArray(modelValue)) {
                                if (modelValue.indexOf(attr.parent.domNode.value) !== -1) {
                                    attr.parent.domNode.setAttribute('checked', 'checked');
                                    attr.parent.domNode.checked = true;
                                } else {
                                    attr.parent.domNode.removeAttribute('checked');
                                    attr.parent.domNode.checked = false;
                                }
                            }
                            else {
                                if (isRadio) {
                                    var hasChecked = attr.parent.domNode.checked;
                                    if (attr.parent.domNode.value !== val && hasChecked) {
                                        attr.parent.domNode.removeAttribute('checked');
                                        attr.parent.domNode.checked = false;
                                    } else if (attr.parent.domNode.value === val && !hasChecked) {
                                        attr.parent.domNode.setAttribute('checked', 'checked');
                                        attr.parent.domNode.checked = true;
                                    }
                                    attr.modelSetValueExpression.func.apply(null, args.concat([val]).concat(scopeArgs));
                                } else {
                                    attr.modelSetValueExpression.func.apply(null, args.concat([val]).concat(scopeArgs));
                                    if (isBoolean) {
                                        if (val) {
                                            attr.parent.domNode.setAttribute('checked', 'checked');
                                            attr.parent.domNode.checked = true;
                                        } else {
                                            attr.parent.domNode.removeAttribute('checked');
                                            attr.parent.domNode.checked = false;
                                        }
                                    }
                                }
                            }
                        }
                        elm.removeEventListener(eventName, attr.listeners[eventName]);
                        elm.addEventListener(eventName, attr.listeners[eventName]);
                    }
                }
            } catch (ex) {
                console.error(ex);
                console.log(attr.content);
            }
        }

        var getFirstBefore = function (node) {
            var nodeBefore = node;
            var skipCurrent = true;
            var itsParent = false;
            var infLoop = false;
            while (!nodeBefore.domNode || skipCurrent) {
                skipCurrent = false;
                if (nodeBefore.previousNode !== null) {
                    nodeBefore = nodeBefore.previousNode;
                    itsParent = false;
                    if (nodeBefore.isVirtual) {
                        if (nodeBefore === infLoop) {
                            throw new Error("Can't find the node before current!");
                        }
                        infLoop = nodeBefore;
                        // go down
                        var potentialNode = nodeBefore;
                        while (potentialNode !== null && !potentialNode.domNode) {
                            if (potentialNode.isVirtual && potentialNode.children) {
                                potentialNode = potentialNode.children[potentialNode.children.length - 1];
                            } else {
                                potentialNode = null;
                            }
                        }
                        if (potentialNode) {
                            nodeBefore = potentialNode;
                        }
                    }
                } else {
                    if (nodeBefore.parent === null) {
                        return null;
                    }
                    // go up
                    nodeBefore = nodeBefore.parent;
                    itsParent = true;
                }
            }
            return { itsParent: itsParent, node: nodeBefore };
        }

        var nextNodeId = 0;
        var renderScopeStack = [];

        var createDomNode = function (parent, node, insert, skipGroup) {
            // if (node.instance.name === 'ComponentsPage') debugger;
            if (!skipGroup) {
                if (node.isVirtual || node.type === 'text') {
                    // TODO: make property which says if text or virtual node has text or virtual siblings
                    // TODO: make property which indicates if node is text type (shortness)
                    // TODO: make track property to set render version and render group once
                    // render fresh DOM from first text/virtual to the last text/virtual
                    // TODO: save render version and rerender only once node.v = renderVersion (update renderVersion on changes)
                    // TODO: set if node needs rerender sibling on build/compile stage
                    var startNode = node;
                    while (startNode.parent && startNode.parent.isVirtual) {
                        startNode = startNode.parent;
                    }
                    var firstRealNode = getFirstBefore(node);
                    var startParentDomNode = (
                        firstRealNode
                            && firstRealNode.itsParent
                            ? firstRealNode.node.domNode
                            : firstRealNode && firstRealNode.node.domNode.parentNode
                        // && firstRealNode.domNode.parentNode
                    ) || parent;
                    var fromNode = startNode;
                    while (
                        fromNode.previousNode
                        && (fromNode.previousNode.isVirtual || fromNode.previousNode.type === 'text')
                    ) {
                        fromNode = fromNode.previousNode;
                    }
                    var toNode = startNode;
                    while (
                        toNode.nextNode
                        && (toNode.nextNode.isVirtual || toNode.nextNode.type === 'text')
                    ) {
                        toNode = toNode.nextNode;
                    }
                    if (fromNode !== startNode || toNode !== startNode) {
                        // console.log('render from ', fromNode, ' to ', toNode);
                        var currentNode = fromNode;
                        var hasNext = true;
                        while (hasNext) {
                            createDomNode(startParentDomNode, currentNode, true, true);
                            if (currentNode.isVirtual && currentNode === node.parent) {
                                createDomNode(startParentDomNode, node, true, true);
                            }
                            hasNext = currentNode !== toNode;
                            // if (hasNext && !currentNode.nextNode) {
                            //     debugger;
                            // }
                            currentNode = currentNode.nextNode;
                        }
                        return;
                    }
                }
            }
            if (node.renderIteration === renderIteration) {
                // node has been rendered already, skipping
                return;
            }
            node.renderIteration = renderIteration;
            if (insert) {
                // console.log(node.children[0].contents[0].content, node);
                var condition = node.parent && node.parent.condition;
                var active = condition && condition.value;
                if (condition && !active) { // remove
                    removeDomNodes([node]);
                    return;
                }
            }
            if (!node.isVirtual && node.condition && !node.condition.value) {
                return;
            }
            if (!node.instance.component) {
                node.instance.component = createInstance(node.instance);
            }
            if (!node.instance.isMounted) {
                mountInstance(node.instance);
            }
            var texts = [];
            for (var i in node.contents) {
                var contentExpression = node.contents[i];
                if (contentExpression.call) {
                    var args = [contentExpression.instance.component, $this];
                    if (node.scope) {
                        for (var k in node.scope.stack) {
                            args.push(node.scope.data[node.scope.stack[k]]);
                        }
                    }
                    texts.push(contentExpression.func.apply(null, args));
                } else {
                    texts.push(contentExpression.content);
                }
            }
            var val = texts.join('');
            var elm = false;
            var nextInsert = false;
            if (node.skipIteration) {
                node.skipIteration = false;
                var vvn = node;
                while (vvn.isVirtual) {
                    vvn = vvn.parent;
                }
                elm = vvn.domNode;
                var saved = currentLevelDomArray.first(
                    /**
                     * 
                     * @param {Node} x 
                     * @param {number} index 
                     */
                    function (x, index) {
                        return x === elm;
                    },
                    true
                );
                if (saved && saved[0].parentNode) {
                    takenDomArray[saved[1]] = true;
                }
                if (node.refreshAttributes && node.attributes) {
                    node.refreshAttributes = false;
                    for (var a in node.attributes) {
                        renderAttribute(elm, node.attributes[a]);
                    }
                }
            } else {
                switch (node.type) {
                    case 'text': { // TODO: implement text insert
                        if (parent.doctype) {
                            elm = parent.doctype; // TODO: check for <!DOCTYPE html> node
                            break;
                        }
                        var skip = false;
                        var nodeBefore = getFirstBefore(node);
                        if (insert) {
                            // look up for previous text to append or insert after first tag
                            if (nodeBefore == null) {
                                return; // throw error ??
                            }
                        }
                        if (!skip) {
                            if (nodeBefore && nodeBefore.node.type == 'text') {
                                nodeBefore.node.domNode.nodeValue += val;
                                if (node.domNode !== null) {
                                    node.domNode.parentNode && node.domNode.parentNode.removeChild(node.domNode);
                                    node.domNode = null;
                                }
                            } else {
                                if (node.domNode !== null && node.domNode.parentNode === parent) {
                                    if (node.domNode.nodeValue !== val) {
                                        node.domNode.nodeValue = val;
                                    }
                                    elm = node.domNode;
                                } else {
                                    elm = document.createTextNode(val);
                                    var nextSibling = nodeBefore.node.domNode.nextSibling;
                                    if (!nodeBefore.itsParent && nextSibling !== null) {
                                        nextSibling.parentNode.insertBefore(elm, nextSibling);
                                    } else if (nodeBefore.itsParent) {
                                        if (nodeBefore.node.domNode.childNodes.length > 0) {
                                            nodeBefore.node.domNode.insertBefore(elm, nodeBefore.node.domNode.childNodes[0]);
                                        } else {
                                            nodeBefore.node.domNode.appendChild(elm);
                                        }
                                    } else {
                                        (nodeBefore.node.domNode.parentNode || parent).appendChild(elm);
                                    }
                                    node.domNode = elm;
                                }
                            }
                        }
                        break;
                    }
                    case 'tag': {
                        if (parent.documentElement) {
                            elm = parent.documentElement;
                            node.domNode = elm;
                            takenDomArray[0] = true;
                            takenDomArray[1] = true;
                            break;
                        }
                        if (!hydrate && val in resourceTags) {
                            // create to compare
                            var newNode = elm = document.createElement(val);
                            node.domNode = elm;
                            createDOM(newNode, node, node.children, nextInsert, skipGroup);
                            if (node.attributes) {
                                for (var a in node.attributes) {
                                    renderAttribute(newNode, node.attributes[a]);
                                }
                            }
                            // search in parent
                            var equalNode = currentLevelDomArray.first(
                                function (x, index) {
                                    return !(index in takenDomArray) && x.isEqualNode(newNode);
                                },
                                true
                            );
                            if (equalNode) {
                                takenDomArray[equalNode[1]] = true;
                                node.domNode = equalNode[0];
                                // console.log('Reusing from DOM', equalNode[0]);
                                // put in correct order
                                var nodeBefore = getFirstBefore(node);
                                var nextSibling = nodeBefore.node.domNode.nextSibling;
                                if (!nodeBefore.itsParent && nextSibling !== null) {
                                    nextSibling.parentNode.insertBefore(equalNode[0], nextSibling);
                                } else if (nodeBefore.itsParent) {
                                    nodeBefore.node.domNode.appendChild(equalNode[0]);
                                } else {
                                    nodeBefore.node.domNode.parentNode.appendChild(equalNode[0]);
                                }
                                break;
                            }
                            // search in resourcesCache                    
                            if (!equalNode) {
                                // TODO: filter: if not used (parentNode == null && !HTML)
                                equalNode = resourcesCache.first(
                                    function (x) {
                                        return x.isEqualNode(newNode);
                                    }
                                );
                                if (equalNode) {
                                    node.domNode = equalNode;
                                    // console.log('Reusing from cache', equalNode);
                                    // put in correct order
                                    var nodeBefore = getFirstBefore(node);
                                    var nextSibling = nodeBefore.node.domNode.nextSibling;
                                    if (!nodeBefore.itsParent && nextSibling !== null) {
                                        nextSibling.parentNode.insertBefore(equalNode, nextSibling);
                                    } else if (nodeBefore.itsParent) {
                                        nodeBefore.node.domNode.appendChild(equalNode);
                                    } else {
                                        nodeBefore.node.domNode.parentNode.appendChild(equalNode);
                                    }
                                    break;
                                }
                            }
                            // isEqualNode
                            // skip script for now, TODO: process scripts, styles
                        }
                        if (!hydrate && val === 'head') {
                            var firstMatch = currentLevelDomArray.first(
                                function (x) {
                                    return x.nodeName.toLowerCase() === val;
                                },
                                true
                            );
                            elm = firstMatch[0];
                            takenDomArray[firstMatch[1]] = true;
                            node.domNode = elm;
                            // console.log('taking head from DOM');
                            break;
                        }

                        var existentElm = cleanRender ? currentLevelDomArray.first(
                            /**
                             * 
                             * @param {Node} x 
                             * @param {number} index 
                             */
                            function (x, index) {
                                return x.nodeName.toLowerCase() === val && !(index in takenDomArray);
                            },
                            true
                        ) : null;

                        if (existentElm && existentElm[0].parentNode) {
                            takenDomArray[existentElm[1]] = true;
                            if (currentElemPosition == existentElm[1]) {
                                // reuse
                                // TODO: clear attributes
                                elm = existentElm[0];
                                node.domNode = elm;
                                break;
                            }
                            else if (!(existentElm[1] in takenDomArray)) {
                                existentElm[0].parentNode.removeChild(existentElm[0]);
                            }
                        }
                        var isSvg = (val in svgMap || parent.isSvg);
                        elm = isSvg
                            ? document.createElementNS(
                                'http://www.w3.org/2000/svg',
                                val
                            )
                            : document.createElement(val);
                        isSvg && (elm.isSvg = true);

                        if (node.domNode !== null && node.domNode.parentNode) {
                            node.domNode.parentNode.replaceChild(elm, node.domNode);
                            node.children && removeDomNodes(node.children);
                        } else {
                            var nodeBefore = getFirstBefore(node);
                            if (nodeBefore == null) {
                                return;
                                // break; // throw error ??
                            }
                            var nextSibling = nodeBefore.node.domNode.nextSibling;
                            if (!nodeBefore.itsParent && nextSibling !== null) {
                                nextSibling.parentNode.insertBefore(elm, nextSibling);
                            } else if (nodeBefore.itsParent) {
                                // nodeBefore.node.domNode.appendChild(elm);
                                if (nodeBefore.node.domNode.childNodes.length > 0) {
                                    nodeBefore.node.domNode.insertBefore(elm, nodeBefore.node.domNode.childNodes[0]);
                                } else {
                                    nodeBefore.node.domNode.appendChild(elm);
                                }
                            } else {
                                (nodeBefore.node.domNode.parentNode || parent).appendChild(elm);
                            }
                        }
                        node.domNode = elm;
                        if (val in resourceTags) {
                            resourcesCache.push(elm);
                        }
                        if (node.attributes) {
                            for (var a in node.attributes) {
                                renderAttribute(elm, node.attributes[a]);
                            }
                        }
                        break;
                    }
                    case 'comment': {
                        elm = document.createComment(val);
                        if (node.domNode !== null) {
                            node.domNode.parentNode.replaceChild(elm, node.domNode);
                        } else {
                            // if (insert) {
                            // find first previous not virtual up tree non virtual
                            var nodeBefore = getFirstBefore(node);
                            if (nodeBefore == null) {
                                return;
                                break; // throw error ??
                            }
                            var nextSibling = nodeBefore.node.domNode.nextSibling;
                            if (!nodeBefore.itsParent && nextSibling !== null) {
                                nextSibling.parentNode.insertBefore(elm, nextSibling);
                            } else if (nodeBefore.itsParent) {
                                if (nodeBefore.node.domNode.childNodes.length > 0) {
                                    nodeBefore.node.domNode.insertBefore(elm, nodeBefore.node.domNode.childNodes[0]);
                                } else {
                                    nodeBefore.node.domNode.appendChild(elm);
                                }
                            } else {
                                nodeBefore.node.domNode.parentNode.appendChild(elm);
                            }
                            // } else {
                            //     parent.appendChild(elm);
                            // }
                        }
                        node.domNode = elm;
                        break;
                    }
                    case 'if': {
                        // TODO: check condition
                        // TODO: if false remove node if exists
                        // TODO: if true create element
                        usedSubscriptions = {};
                        if (!node.instance.component) {
                            node.instance.component = createInstance(node.instance);
                        }
                        var args = [node.instance.component, $this];
                        if (node.scope) {
                            for (var k in node.scope.stack) {
                                args.push(node.scope.data[node.scope.stack[k]]);
                            }
                        }
                        var nextValue = !!node.condition.func.apply(null, args);
                        if (node.condition.value !== undefined && nextValue === node.condition.value) {
                            if (val !== 'template') {
                                if (node.children) {
                                    for (var i = 0; i < node.children.length; i++) {
                                        if (node.children[i].domNode) {
                                            node.children[i].domNode.usedByRenderer = true;
                                        }
                                    }
                                }
                                return; // nothing's changed
                            }
                        }
                        node.condition.value = nextValue;
                        elm = parent;
                        node.parentDomNode = parent;
                        node.condition.previousValue = node.condition.value;
                        node.topRealPreviousNode = (node.parent && node.parent.topRealPreviousNode) || node.previousNode;
                        nextInsert = true;
                        break;
                    }
                    case 'else-if': {
                        if (!node.instance.component) {
                            node.instance.component = createInstance(node.instance);
                        }
                        var args = [node.instance.component, $this];
                        if (node.scope) {
                            for (var k in node.scope.stack) {
                                args.push(node.scope.data[node.scope.stack[k]]);
                            }
                        }
                        var nextValue = !node.previousNode.condition.value
                            && !!node.condition.func.apply(null, args);

                        node.condition.previousValue = node.previousNode.condition.value || nextValue;
                        if (node.condition.value !== undefined && nextValue === node.condition.value) {
                            if (val !== 'template') {
                                if (node.children) {
                                    for (var i = 0; i < node.children.length; i++) {
                                        if (node.children[i].domNode) {
                                            node.children[i].domNode.usedByRenderer = true;
                                        }
                                    }
                                }
                                return; // nothing's changed
                            }
                        }
                        node.condition.value = nextValue;
                        elm = parent;
                        node.parentDomNode = parent;
                        node.topRealPreviousNode = (node.parent && node.parent.topRealPreviousNode) || node.previousNode;
                        nextInsert = true;
                        break;
                    }
                    case 'else': {
                        var nextValue = !node.previousNode.condition.previousValue;
                        if (node.condition.value !== undefined && nextValue === node.condition.value) {
                            if (val !== 'template') {
                                if (node.children) {
                                    for (var i = 0; i < node.children.length; i++) {
                                        if (node.children[i].domNode) {
                                            node.children[i].domNode.usedByRenderer = true;
                                        }
                                    }
                                }
                                return; // nothing's changed
                            }
                        }
                        node.condition.value = nextValue;
                        elm = parent;
                        node.parentDomNode = parent;
                        node.topRealPreviousNode = (node.parent && node.parent.topRealPreviousNode) || node.previousNode;
                        nextInsert = true;
                        break;
                    }
                    case 'template': {
                        elm = parent;
                        nextInsert = true;
                        break;
                    }
                    case 'foreach': {
                        elm = parent;
                        nextInsert = true;
                        // console.log('foreach');
                        if (elm) {
                            // create n nodes (copy of children) and render
                            if (!node.itemChildren) { // TODO: bug, need to rewrite
                                node.itemChildren = node.children;
                            }
                            // removeDomNodes(node.children);
                            // node.children = null;
                            if (!node.instance.component) {
                                node.instance.component = createInstance(node.instance);
                            }
                            var args = [node.instance.component, $this];
                            if (node.scope) {
                                for (var k in node.scope.stack) {
                                    args.push(node.scope.data[node.scope.stack[k]]);
                                }
                            }
                            var data = node.forExpression.data.apply(null, args);
                            // if (data && data.length > 0) {
                            //     node.children = [];
                            // }
                            var prevNode = null;
                            var isNumeric = Array.isArray(data);
                            var used = {};
                            var keepIndexes = {};
                            var newChildren = [];
                            for (var k in data) {
                                var dataKey = isNumeric ? +k : k;
                                var found = false;
                                if (node.children) {
                                    for (var i = 0; i < node.children.length; i++) {
                                        if (k in used || i in keepIndexes) {
                                            continue;
                                        }
                                        if (node.children[i].foreachData === data[k]) {
                                            used[k] = true;
                                            node.children[i].previousNode = prevNode;
                                            if (prevNode) {
                                                prevNode.nextNode = node.children[i];
                                            }
                                            prevNode = node.children[i];
                                            node.children[i].scope.data[node.forExpression.key] = dataKey;
                                            newChildren.push(node.children[i]);
                                            keepIndexes[i] = true;
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                                if (!found) {
                                    var wrapperNode = {
                                        type: 'template',
                                        isVirtual: true,
                                        parent: node,
                                        previousNode: prevNode,
                                        instance: Object.assign({}, node.instance),
                                        domNode: null,
                                        scope: node.scope,
                                        foreachData: data[k],
                                        foreachKey: dataKey
                                    };
                                    wrapperNode.scope = {
                                        parentScope: node.scope,
                                        data: Object.assign({}, node.scope.data),
                                        stack: node.scope.stack.slice()
                                    }
                                    if (prevNode) {
                                        prevNode.nextNode = wrapperNode;
                                    }
                                    prevNode = wrapperNode;
                                    wrapperNode.scope.stack.push(node.forExpression.key);
                                    wrapperNode.scope.stack.push(node.forExpression.value);
                                    wrapperNode.scope.data[node.forExpression.key] = dataKey;
                                    wrapperNode.scope.data[node.forExpression.value] = data[k];
                                    scopeNodes(wrapperNode, node.itemChildren);
                                    newChildren.push(wrapperNode);
                                }
                            }
                            // remove dom nodes in unused
                            if (node.children != null) {
                                if (newChildren.length > 0) {
                                    for (var i = node.children.length - 1; i >= 0; i--) {
                                        if (!(i in keepIndexes)) {
                                            removeDomNodes([node.children[i]], true);
                                        }
                                    }
                                } else {
                                    removeDomNodes(node.children, true);
                                }
                            }
                            // set new children
                            if (newChildren.length > 0) {
                                node.children = newChildren;
                            } else {
                                node.children = null;
                            }
                            // TODO: resubscribe for changes, remove subscriptions for itemChildren

                        }
                        // console.log(node, data);
                        break;
                    }
                    case 'dynamic': { // dynamic tag or component
                        // wrap into template
                        // clone child for tag
                        // or build component
                        // render
                        // if(node.parent.domNode?.getAttribute('class') === 'has-left-nav')
                        // {
                        //     debugger;
                        // }
                        elm = parent;
                        nextInsert = true;
                        if (node.latestVal === val) {
                            if (node.children) {
                                for (var i = 0; i < node.children.length; i++) {
                                    if (node.children[i].domNode) {
                                        node.children[i].domNode.usedByRenderer = true;
                                    }
                                }
                            }
                            return;
                        }
                        removeDomNodes(node.children);
                        node.children = null;
                        var wrapperNode = {
                            contents: node.contents,
                            attributes: node.attributes,
                            parent: node,
                            previousNode: null,
                            scope: node.scope,
                            instance: node.instance,
                            domNode: null
                        };
                        if (node.itemChildren) {
                            copyNodes(wrapperNode, node.itemChildren);
                        }
                        if (val in availableTags) { // it's a tag
                            wrapperNode.type = 'tag';
                            wrapperNode.root = node.root;
                        } else {
                            // build component
                            // componentChildren
                            var dynamicNodes = create(val, wrapperNode.children, node.attributes, false, false, node.instance);
                            createInstance(dynamicNodes.wrapper);
                            mountInstance(dynamicNodes.wrapper);
                            instantiateChildren(dynamicNodes.root);
                            wrapperNode.type = 'template';
                            wrapperNode.isVirtual = true;
                            wrapperNode.children = dynamicNodes.versions['main'];
                            // reassign parent
                            wrapperNode.children.each(function (x) {
                                x.parent = wrapperNode;
                            });
                        }
                        node.children = [wrapperNode];

                        node.latestVal = val;
                        // console.log(node, val);
                        break;
                    }
                    case 'raw': {
                        elm = parent;
                        nextInsert = true;
                        if (node.latestHtml === val) {
                            if (node.rawNodes) {
                                for (var i = 0; i < node.rawNodes.length; i++) {
                                    node.rawNodes[i].domNode.usedByRenderer = true;
                                }
                            }
                            if (!node.subscribed && node.subs) {
                                for (var s in node.subs) {
                                    listenTo(node, node.subs[s]);
                                }
                                node.subscribed = true;
                            }
                            return;
                        }
                        node.latestHtml = val;
                        if (node.rawNodes) {
                            removeDomNodes(node.rawNodes);
                        }
                        node.children = null;
                        node.rawNodes = null;
                        var firstParentNode = getFirstParentWithDom(node);
                        if (firstParentNode) {
                            // console.log(val);
                            var vdom = document.createElement(firstParentNode.domNode.nodeName);
                            vdom.innerHTML = val;
                            // cases:
                            // 1: only text node
                            // 2: only non text node(s)
                            // 3: text,..any, text
                            // 4: text,.. any, non text
                            // console.log({ d: vdom });
                            if (vdom.childNodes.length > 0) {
                                var startI = 0;
                                var firstClosest = getFirstBefore(node);
                                if (!firstClosest.itsParent
                                    && firstClosest.node.type === 'text'
                                    && vdom.childNodes[0].nodeType === 3
                                ) { // merge text
                                    firstClosest.node.domNode.nodeValue +=
                                        vdom.childNodes[0].nodeValue;
                                    startI = 1;
                                }
                                var newNodes = [];

                                // insert after
                                for (startI; startI < vdom.childNodes.length; startI++) {
                                    newNodes.push({
                                        domNode: vdom.childNodes[startI]
                                    });
                                }
                                var nextSibling = firstClosest.node.domNode.nextSibling;
                                if (newNodes.length > 0) {
                                    for (var i = 0; i < newNodes.length; i++) {
                                        if (!firstClosest.itsParent && nextSibling) {
                                            nextSibling.parentNode.insertBefore(newNodes[i].domNode, nextSibling);
                                        } else if (firstClosest.itsParent) {
                                            firstClosest.node.domNode.appendChild(newNodes[i].domNode);
                                        } else {
                                            firstClosest.node.domNode.parentNode.appendChild(newNodes[i].domNode);
                                        }
                                    }
                                    var latestNode = newNodes[newNodes.length - 1];
                                    node.children = [{
                                        type: latestNode.domNode.nodeType === 3 ? 'text' : 'tag', // non text, tag is good
                                        parent: node,
                                        previousNode: null,
                                        scope: node.scope,
                                        instance: node.instance,
                                        domNode: latestNode.domNode
                                    }];
                                    node.rawNodes = newNodes;
                                }
                            }
                        }
                        if (node.rawNodes) {
                            for (var i = 0; i < node.rawNodes.length; i++) {
                                node.rawNodes[i].domNode.usedByRenderer = true;
                            }
                        }
                        if (node.subs && !node.subscribed) {
                            for (var s in node.subs) {
                                listenTo(node, node.subs[s]);
                            }
                            node.subscribed = true;
                        }
                        return; // do not run children
                    }
                    default:
                        throw new Error('Node type \'' + node.type + '\' is not implemented.');
                }
            }
            if (!node.isVirtual && elm && node.root) {
                node.instance.component._element = elm;
            }
            if (elm) {
                elm.usedByRenderer = true;
            }
            // TODO: cover cases: if, else if, else
            if (node.subs && !node.subscribed) {
                for (var s in node.subs) {
                    listenTo(node, node.subs[s]);
                }
                node.subscribed = true;
            }
            elm && createDOM(elm, node, node.children, nextInsert, skipGroup);
        }

        var currentParent = null;
        var currentLevelDomArray = [];
        var takenDomArray = {};
        var cleanRender = false;
        var currentElemPosition = 0;

        var createDOM = function (parent, node, nodes, insert, skipGroup) {
            var previousParent = currentParent;
            var previousLevelDomArray = currentLevelDomArray;
            var previousTakenDomArray = takenDomArray;
            currentParent = parent;

            if (parent.childNodes && !node.isVirtual) {
                for (var i = 0; i < parent.childNodes.length; i++) {
                    if ('usedByRenderer' in parent.childNodes[i]) {
                        parent.childNodes[i].usedByRenderer = false;
                    }
                }
            }

            if (cleanRender && parent !== previousParent) {
                currentLevelDomArray = Array.prototype.slice.call(currentParent.childNodes);
                takenDomArray = {};
            }
            for (var i in nodes) {
                // if (nodes[i].skipIteration) {
                var saved = currentLevelDomArray.first(
                    function (x, index) {
                        return x === nodes[i].domNode;
                    },
                    true
                );
                if (saved && saved[0].parentNode) {
                    takenDomArray[saved[1]] = true;
                }
                // }
            }
            for (var i in nodes) {
                currentElemPosition = i;
                nodes[i].childInstances && instantiateChildren(nodes[i]);
                createDomNode(parent, nodes[i], insert, skipGroup);
            }
            if (cleanRender) {
                // currentLevelDomArray.each(function (x, k) {
                //     if (
                //         !(k in takenDomArray)
                //         && x.parentNode
                //     ) {
                //         x.parentNode.removeChild(x);
                //     }
                // });
            }
            if (parent.childNodes && !node.isVirtual) {
                for (var i = parent.childNodes.length - 1; i >= 0; i--) {
                    if (!parent.childNodes[i].usedByRenderer) {
                        if ('usedByRenderer' in parent.childNodes[i]) {
                            parent.removeChild(parent.childNodes[i]);
                        }
                    }
                }
            }
            currentParent = previousParent;
            currentLevelDomArray = previousLevelDomArray;
            takenDomArray = previousTakenDomArray;
        }

        var getFirstParentWithDom = function (node) {
            if (!node.parent) {
                return null;
            }
            if (node.parent.domNode) {
                return node.parent;
            }
            return getFirstParentWithDom(node.parent);
        }

        var removeDomNodes = function (nodes, unsubscribe) {
            for (var k in nodes) {
                // TODO: destroy components on delete
                if (nodes[k].children) {
                    removeDomNodes(nodes[k].children, unsubscribe);
                }
                if (nodes[k].domNode) {
                    if (nodes[k].domNode.parentNode) {
                        nodes[k].domNode.parentNode.removeChild(nodes[k].domNode);
                    }
                    // else if (!silent) {
                    //     // console.log('Can\'t remove', nodes[k]);
                    // }
                    nodes[k].domNode = null;
                }
                if (conditionalTypes.includes(nodes[k].type)) {
                    delete nodes[k].condition.value;
                }
                if (nodes[k].latestVal) {
                    delete nodes[k].latestVal;
                }
                if (nodes[k].skipIteration) {
                    nodes[k].skipIteration = false;
                }
                if (nodes[k].origin) {
                    for (var oi in nodes[k].origin) {
                        if (nodes[k].origin[oi]) {
                            nodes[k].origin[oi].skipIteration = false;
                            nodes[k].origin[oi].domNode = null;
                            nodes[k].origin[oi] = null;
                        }
                    }
                }
                if (unsubscribe && nodes[k].subs) {
                    nodes[k].mute = true;
                }
            }
        }

        var instancesScope = {};
        var cleanInstance = false;
        var scopeNodes = function (parent, nodes) {
            instancesScope = {};
            cleanInstance = true;
            copyNodes(parent, nodes);
            cleanInstance = false;
        };

        var copyNodes = function (parent, nodes) {
            var prev = null;
            var newChildren = nodes.select(function (x) {
                var z = cloneNode(parent, x);
                z.parent = parent;
                z.previousNode = prev;
                prev = z;
                if (z.previousNode) {
                    z.previousNode.nextNode = z;
                }
                return z;
            });
            if (!parent.itemChildren) {
                parent.children = newChildren;
            } else {
                parent.itemChildren = newChildren;
            }
        };

        var cloneNode = function (parent, node) {
            var copy = Object.assign({}, node);
            node.cloned = true;
            delete copy.cloned;
            delete copy.subscribed;
            copy.nextNode = null;
            copy.previousNode = null;
            copy.domNode = null;
            copy.scope = parent.scope || copy.scope;
            if (node.condition) {
                if (conditionalTypes.includes(node.type)) {
                    copy.condition = Object.assign({}, node.condition);
                } else {
                    copy.condition = parent.condition;
                }
            }
            if (cleanInstance) {
                if (!copy.instance.component) {
                    if (copy.instance.__id in instancesScope) {
                        copy.instance = instancesScope[copy.instance.__id];
                    } else {
                        copy.instance = Object.assign({}, node.instance);
                        instancesScope[copy.instance.__id] = copy.instance;
                        copy.instance.__id = ++nextInstanceId;
                        instancesScope[copy.instance.__id] = copy.instance;
                    }
                    if (copy.instance.attributes) {
                        copy.instance.attributes = copy.instance.attributes.select(function (x) {
                            var attr = Object.assign({}, x);
                            attr.scope = copy.scope || attr.scope;
                            attr.origin = Object.assign({}, x.origin);
                            delete attr.childComponent;
                            return attr;
                        });
                    }
                }
                // TODO: new __id for each iteration level, keep instances
                if (node.childInstances) {
                    copy.childInstances = node.childInstances.select(function (x) {
                        if (!x.wrapper.component) {
                            var childInstance = Object.assign({}, x);
                            if (x.wrapper.__id in instancesScope) {
                                childInstance.wrapper = instancesScope[x.wrapper.__id];
                            } else {
                                childInstance.wrapper = Object.assign({}, x.wrapper);
                                instancesScope[childInstance.wrapper.__id] = childInstance.wrapper;
                                childInstance.wrapper.__id = ++nextInstanceId;
                                instancesScope[childInstance.wrapper.__id] = childInstance.wrapper;
                                if (childInstance.wrapper.attributes) {
                                    childInstance.wrapper.attributes = x.wrapper.attributes.select(function (y) {
                                        var attr = Object.assign({}, y);
                                        attr.scope = copy.scope || attr.scope;
                                        return attr;
                                    });
                                }
                            }
                            return childInstance;
                        }
                        return x;
                    });
                }
                copy.contents = copy.contents.select(function (x) {
                    var content = Object.assign({}, x);
                    if (content.call && content.instance.__id in instancesScope) {
                        content.instance = instancesScope[content.instance.__id];
                    }
                    return content;
                });
            }
            if (copy.attributes) {
                copy.attributes = copy.attributes.select(function (a) {
                    var aCopy = Object.assign({}, a);
                    aCopy.parent = copy;
                    a.cloned = true;
                    delete aCopy.cloned;
                    delete aCopy.subscribed;
                    if (cleanInstance && !aCopy.instance.component) {
                        if (aCopy.instance.__id in instancesScope) {
                            aCopy.instance = instancesScope[aCopy.instance.__id]
                        } else {
                            aCopy.instance = Object.assign({}, node.instance);
                            instancesScope[aCopy.instance.__id] = aCopy.instance;
                            aCopy.instance.__id = ++nextInstanceId;
                            instancesScope[aCopy.instance.__id] = aCopy.instance;
                            // console.log(instancesScope);
                            aCopy.instance.attributes = aCopy.instance.attributes.select(function (x) {
                                var attr = Object.assign({}, x);
                                attr.scope = aCopy.scope || attr.scope;
                                return attr;
                            });
                        }
                    }

                    aCopy.scope = copy.scope || aCopy.scope;
                    if (a.children) {
                        a.children = a.children.select(function (attributeChildren) {
                            var attributeChildrenCopy = Object.assign({}, attributeChildren);
                            attributeChildrenCopy.parent = copy;
                            attributeChildren.cloned = true;
                            delete attributeChildrenCopy.cloned;
                            delete attributeChildrenCopy.subscribed;
                            return attributeChildrenCopy;
                        });
                    }
                    return aCopy;
                });
            }
            // console.log(copy.instance);
            // copy.instance = Object.assign({}, node.instance);
            // copy.instance.component = null;
            if (node.children || node.itemChildren) {
                copyNodes(copy, node.children || node.itemChildren);
            }
            return copy;
        };

        var nextInstanceId = 0;

        var getInstanceId = function (instance, id) {
            if (!('__id' in instance)) {
                Object.defineProperty(instance, "__id", {
                    enumerable: false,
                    writable: false,
                    value: id || ++nextInstanceId
                });
            }
            return instance.__id;
        }

        var renderQueue = {};
        var subscribers = {};
        var lastSubscribers = {};
        var propsSubs = {};

        var listenTo = function (node, path) {
            // path === 'this.application' && console.log(node, path);
            // if(path === 'this.application' && node?.childComponent?.__id === 11)debugger;
            // TODO: resibscribe instance on reuse
            var isAttribute = node.isAttribute;
            var instance = isAttribute ? node.parent.instance : node.instance;
            var iid = getInstanceId(instance);
            if (!(iid in subscribers)) {
                subscribers[iid] = {};
            }
            var pathParts = path.split('.');
            var firstPart = pathParts[0];
            var paths = [];
            for (var i = 1; i < pathParts.length; i++) {
                var pathKey = pathParts[i].split('[');
                if (pathKey.length > 1) {
                    paths.push(firstPart + '.' + pathKey[0]);
                }
                firstPart = firstPart + '.' + pathParts[i];
                paths.push(firstPart);
            }
            for (var i = 0; i < paths.length; i++) {
                var pathToListen = paths[i];
                if (!(pathToListen in subscribers[iid])) {
                    subscribers[iid][pathToListen] = [];
                }
                subscribers[iid][pathToListen].push(node);

                if (pathToListen in propsSubs) {
                    var propSubscription = propsSubs[pathToListen];
                    var propInstance = propSubscription.instance;
                    var propPaths = propSubscription.subs;
                    var iidProp = getInstanceId(propInstance);
                    if (!(iidProp in subscribers)) {
                        subscribers[iidProp] = {};
                    }
                    for (var p in propPaths) {
                        var propPath = propPaths[p];
                        if (!(propPath in subscribers[iidProp])) {
                            subscribers[iidProp][propPath] = [];
                        }
                        subscribers[iidProp][propPath].push(node);
                    }
                }
            }
        }

        // TODO: on change conditions, insert element if new, remove if not active
        // TODO: try catch
        var reRender = function () {
            var queue = renderQueue;
            renderQueue = {};
            renderIteration++;
            for (var path in queue) {
                for (var i in queue[path]) {
                    try {
                        var node = queue[path][i];
                        if (node.mute) {
                            continue;
                        }
                        if (node.isAttribute) {
                            var domNode = node.parent.type === 'dynamic' ? (node.parent.children && node.parent.children.length > 0 && node.parent.children[0].domNode) : node.parent.domNode;
                            if (domNode) {
                                renderAttribute(domNode, node);
                            } else if (node.parent.type === 'component' && node.childComponent) {
                                // reassign property
                                var args = [node.instance.component, $this];
                                if (node.scope) {
                                    for (var k in node.scope.stack) {
                                        args.push(node.scope.data[node.scope.stack[k]]);
                                    }
                                }
                                currentValue = null;
                                for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                                    var contentValue = node.children[childIndex].propExpression.call
                                        ? node.children[childIndex].propExpression.func.apply(null, args)
                                        : node.children[childIndex].propExpression.content;
                                    currentValue = childIndex === 0 ? contentValue : currentValue + contentValue;
                                }
                                if (node.content === 'model') {
                                    // isModel
                                    if (node.childComponent._model[2]) {
                                        node.childComponent._model[2].func.apply(null, [node.childComponent, $this, currentValue]);
                                    } else {
                                        node.childComponent['modelValue'] = currentValue;
                                    }
                                } else {
                                    node.childComponent[node.content] = currentValue;
                                }
                            }
                        } else if (node.isVirtual) {
                            createDomNode(node.parentDomNode, node);
                        } else {
                            var parentDomNode = node.domNode && node.domNode.parentNode;
                            if (!parentDomNode) {
                                var parentOrBeforeNode = getFirstBefore(node);
                                parentDomNode = parentOrBeforeNode && parentOrBeforeNode.node.domNode && parentOrBeforeNode.node.domNode.parentNode;
                            }
                            parentDomNode && createDomNode(parentDomNode, node);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
            Object.keys(renderQueue).length > 0 && reRender();
        }

        var onChange = function (deps) {
            for (var key in deps.subs) {
                var dep = deps.subs[key];
                var iid = dep.id;
                if (iid in subscribers
                    && dep.path in subscribers[iid]) {
                    renderQueue[iid + '_' + dep.path] = subscribers[iid][dep.path];
                    setTimeout(function () {
                        reRender();
                    }, 0);
                }
            }
        };

        this.notify = function (obj, type) {
            if (Array.isArray(obj)) {
                var prot = Object.getPrototypeOf(obj);
                if (prot.deps) {
                    onChange(prot.deps);
                }
            }
        };

        //reactivate array
        var ra = function (a, deps) {
            var p = Object.getPrototypeOf(a);
            if ('deps' in p) {
                for (var k in deps) {
                    if (!(k in a.deps)) {
                        a.deps[k] = {}
                    }
                    for (var t in deps[k]) {
                        a.deps[k][t] = deps[k][t];
                    }
                }
                return;
            }
            var np = {};
            Object.defineProperty(np, "deps", {
                enumerable: false,
                writable: false,
                value: deps
            });
            Object.setPrototypeOf(np, p);
            Object.setPrototypeOf(a, np);
            return a;
        }
        var ignoreReactivityList = ['this._element', 'this._refs', 'this._props'];
        var makeReactive = function (obj) {
            var instance = arguments.length > 1 ? arguments[1] : obj;
            var path = arguments.length > 2 ? arguments[2] : 'this';
            var deps = arguments.length > 3 ? arguments[3] : { subs: {} };
            if (ignoreReactivityList.indexOf(path) !== -1) {
                return;
            }
            if (Array.isArray(obj)) {
                // reactivate array
                // TODO: make optimization and fire local changes instead of whole array
                ra(obj, deps);
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i] !== null && typeof obj[i] === 'object') {
                        makeReactive(obj[i], instance, path + '[key]');
                    }
                }
            } else {
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    defineReactive(instance, path + '.' + keys[i], obj, keys[i]);
                    defineReactive(instance, path + '[key]', obj, keys[i]);
                }
            }
            return obj;
        };

        var latestDeps = null;

        var defineReactive = function (instance, path, obj, key) {
            latestDeps = null;
            var deps = null;
            var val = obj[key];
            var itsNew = false;
            if (latestDeps) {
                deps = latestDeps;
            } else {
                deps = { subs: {} };
                itsNew = true;
            }
            if (val !== null && typeof val === 'object') {
                makeReactive(val, instance, path, deps);
            }
            if (typeof val === 'function') { // reactive methods ???
                return;
            }
            var iid = getInstanceId(instance);
            deps.subs[iid + path] = { instance: instance, id: iid, path: path };
            if (itsNew) {
                Object.defineProperty(obj, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        latestDeps = deps;
                        return val;
                    },
                    set: function (newVal) {
                        if (newVal !== val) {
                            onChange(deps);
                            val = newVal;
                            if (val !== null && typeof val === 'object') {
                                makeReactive(val, instance, path, deps);
                            }
                        }
                    }
                });
            }
        };

        var injectionCache = {};

        var resolve = function (name, params, id) {
            // TODO: check scope and/or cache
            var info = $this.components[name];
            if (!info) {
                return null;
            }
            var dependencies = info.dependencies;
            var cache = info.service;
            if (cache && name in injectionCache) {
                return injectionCache[name];
            }
            if (!dependencies) {
                var instance = new (bring(name))();
                if (info.init) {
                    instance.__init();
                }
                getInstanceId(instance, id);
                makeReactive(instance);
                if (cache) {
                    injectionCache[name] = instance;
                }
                return instance;
            }
            var arguments = [null];
            for (var i in dependencies) {
                var d = dependencies[i];
                var a = null; // d.null
                if (params && (d.argName in params)) {
                    a = params[d.argName];
                }
                else if (d.default) {
                    a = d.default; // TODO: copy object or array
                } else if (d.null) {
                    a = null;
                } else if (d.builtIn) {
                    a = d.name === 'string' ? '' : 0;
                } else {
                    a = resolve(d.name);
                }
                arguments.push(a);
            }
            var instance = info.init
                ? new (bring(name))()
                : new ((bring(name)).bind.apply(bring(name), arguments))();
            if (info.init) {
                arguments.shift();
                instance.__init.apply(instance, arguments);
            }
            getInstanceId(instance, id);
            makeReactive(instance);
            if (cache) {
                injectionCache[name] = instance;
            }
            return instance;
        }

        var mergeNodes = function (a, b) {
            var randI = 0;
            var la = a.length;
            var lb = b.length;
            if (la != lb) {
                // console.log('Length is different', la, lb, a, b);
                removeDomNodes(b);
                for (var i = 0; i < la; i++) {
                    if (a[i].skipIteration) {
                        a[i].skipIteration = false;
                        a[i].domNode = null;
                        a[i].children && removeDomNodes(a[i].children, true);
                    }
                }
                return false;
            }
            var allMatched = true;
            for (var i = 0; i < la; i++) {
                if (i < lb) {
                    var matched = !a[i].rootPage;
                    var hasCode = false;
                    var ac = a[i].contents && a[i].contents.select(function (x) { return x.content || (x.code); }).join(); // && ++randI
                    var bc = b[i].contents && b[i].contents.select(function (x) { return x.content || (x.code); }).join();
                    if (a[i].instance.name != b[i].instance.name) {
                        // console.log('Instances don\'t match', [a[i].instance, b[i].instance], a[i], b[i]);
                        matched = false;
                    }
                    if (ac != bc) {
                        // console.log('Contents don\'t match', [ac, bc], a[i], b[i]);
                        matched = false;
                    }
                    // compare attributes
                    // attributes[0].content attributes[0].instance attributes[0].content.children[0].content
                    var aa = a[i].attributes && a[i].attributes.select(function (x) {
                        return (x.content || '') +
                            ((x.children && ';' + x.children.select(function (y) {
                                return y.contentExpression.content || (y.contentExpression.code) || ''
                            }).join(';')) || '');
                    }).join(';');
                    var ba = b[i].attributes && b[i].attributes.select(function (x) {
                        return (x.content || '') +
                            ((x.children && ';' + x.children.select(function (y) {
                                return y.contentExpression.content || (y.contentExpression.code) || ''
                            }).join(';')) || '');
                    }).join(';');
                    if (aa != ba) { // TODO: compare attr instance and attr values
                        // console.log('Attributes don\'t match', aa, ba);
                        matched = false;
                    }
                    if (matched || (a[i].type === 'dynamic' && b[i].type === 'dynamic')) {
                        matched = true;
                        // all matched, reassigning DOM node
                        hasCode = (a[i].contents && a[i].contents.first(function (x) { return x.code; }))
                        // ||

                        if (a[i].condition) {
                            a[i].condition = b[i].condition;
                        }
                        a[i].domNode = b[i].domNode;
                        a[i].domNode = b[i].domNode;
                        if (a[i].instance.__id === b[i].instance.__id) {
                            a[i].subscribed = b[i].subscribed;
                            if (a[i].subscribed && a[i].instance.__id in lastSubscribers) {
                                for (var subPath in lastSubscribers[a[i].instance.__id]) {
                                    for (var subIndex = 0; subIndex < lastSubscribers[a[i].instance.__id][subPath].length; subIndex++) {
                                        if (lastSubscribers[a[i].instance.__id][subPath][subIndex] === b[i]) {
                                            lastSubscribers[a[i].instance.__id][subPath][subIndex] = a[i];
                                        }
                                    }
                                }
                            }
                            // if (a[i].condition) {
                            //     a[i].condition.value = !b[i].condition.value;
                            //     a[i].condition.previousValue = !b[i].condition.previousValue;
                            // }
                        }
                        a[i].skipIteration =
                            !a[i].isVirtual
                            && !!b[i].domNode
                            && !hasCode;
                        // && !a[i].condition;
                        if (a[i].skipIteration) {
                            if (!b[i].origin) {
                                b[i].origin = {};
                            }
                            b[i].origin[a[i].id] = a[i];
                            a[i].refreshAttributes = (a[i].attributes && a[i].attributes.first(function (x) {
                                return x.children && x.children.first(function (y) {
                                    return y.contentExpression.code;
                                });
                            }));
                            if (a[i].refreshAttributes) {
                                // reattach instances
                                a[i].attributes.each(function (attr, index) {
                                    attr.latestValue = b[i].attributes[index].latestValue;
                                    attr.listeners = b[i].attributes[index].listeners;
                                });
                            }
                        }
                        if (b[i].rawNodes) {
                            a[i].rawNodes = b[i].rawNodes;
                            a[i].latestHtml = b[i].latestHtml;
                        }
                        var noRootSlot = true;
                        if (a[i].type === 'dynamic' && a[i].instance === b[i].instance) {
                            if (b[i].latestVal) {
                                var findRootSlot = function (children) {
                                    for (var t = 0; t < children.length; t++) {
                                        if (!children[t].instance.rooted
                                            || (children[t].children && !findRootSlot(children[t].children))
                                        ) {
                                            return false;
                                        }
                                    }
                                    return true;
                                };
                                noRootSlot = findRootSlot(b[i].children); // TODO: investigate multiple merge calls if node is dynamic
                                // !noRootSlot && console.log(['!noRootSlot', b[i].instance.name, b[i].children?.[0].domNode, b[i]]);
                                // if (b[i].parent.domNode?.getAttribute('class') === 'has-left-nav') {
                                //     console.log(['dynamic merge', b[i], a[i]]);
                                //     debugger;
                                // }
                                // console.log(['dynamic merge', b[i].latestVal, a[i].latestVal]);                                
                                // a[i].itemChildren = b[i].itemChildren;
                                // if (noRootSlot && a[i].itemChildren) {
                                //     var wrapperNode = {
                                //         contents: a[i].contents,
                                //         attributes: a[i].attributes,
                                //         parent: a[i],
                                //         previousNode: null,
                                //         scope: a[i].scope,
                                //         instance: a[i].instance,
                                //         domNode: null,
                                //         type: 'tag'
                                //     };
                                //     copyNodes(wrapperNode, a[i].itemChildren);
                                //     a[i].children = [wrapperNode];
                                // }
                                if (noRootSlot && a[i].instance.rooted) {
                                    a[i].children = b[i].children;
                                }
                            }
                        }
                        // console.log('Merged:', a[i], b[i]);
                        if (noRootSlot && b[i].children) {
                            if (a[i].children) {
                                matched = mergeNodes(a[i].children, b[i].children);
                                if (matched && a[i].instance.rooted) {
                                    a[i].latestVal = b[i].latestVal;
                                }
                                // if (noRootSlot) {
                                //     matched = mergeNodes(a[i].children, b[i].children);
                                //     if (matched && a[i].instance.rooted) {
                                //         a[i].latestVal = b[i].latestVal;
                                //     }
                                // }
                            }
                        }
                    } else {
                        // remove DOM node
                        if (b[i].domNode && b[i].domNode.parentNode) {
                            b[i].domNode.parentNode.removeChild(b[i].domNode);
                        } else if (b[i].isVirtual) {
                            if (a[i].previousNode && a[i].previousNode.type === 'text' && a[i].previousNode.skipIteration) {
                                a[i].previousNode.skipIteration = false;
                                removeDomNodes([a[i].previousNode]);
                            }
                            removeDomNodes(b[i].children);
                        }
                        a[i].children && removeDomNodes(a[i].children); // TODO: reuse dom items
                        if (b[i].rawNodes) {
                            a[i].rawNodes = b[i].rawNodes;
                            a[i].latestHtml = b[i].latestHtml;
                        }
                    }
                    allMatched = allMatched && matched;
                }
            }
            return allMatched;
        };

        var parentComponentName = null;

        var tryCopyObjectList = function (a) {
            return a ? a.select(function (item) { return Object.assign({}, item); }) : null;
        }

        var create = function (name, childNodes, attributes, params, isRoot, meta) {
            if (!(name in $this.components)) {
                throw new Error('Component ' + name + ' doesn\'t exist.');
            }
            var builtNodes = null;
            var instanceWrapper = null;
            var key = false;
            var reuseEnabled = meta.parentInstance && (meta.parentInstance.rooted || (meta.parentInstance.isRoot && meta.level === 0));
            // isRoot && console.log(['isRoot', name]);
            // meta.level === 0 && console.log([meta.level, name]);
            // meta.parentInstance && meta.parentInstance.isRoot && console.log(['parentIsRoot', meta.parentInstance.isRoot, name, 'level', meta.level]);
            // if (parentComponentName === currentPage.name) {
            // reuse wrapper components
            if (reuseEnabled) {
                // TODO: track level (tree level in template): ex: <Layout = level 0, BaseLayout =0, etc.
                // TODO: keep reused components in map ([key: level 0 component name]:[...components])
                key = (meta.level === 0 ? '' : meta.parentInstance.name + '_') + name;
                // ['BaseLayout', 'Layout', 'NavigationDrawer', 'ComponentsLayout'].includes(name) && 
                // console.log('Looking', name, key, meta.level, meta.parentInstance.rooted);
                var same = latestPage.components.first(function (x) {
                    return x.instanceWrapper.key === key;
                }, true);
                if (same) {
                    latestPage.components.splice(same[1], 1);
                    builtNodes = same[0].build;
                    instanceWrapper = same[0].instanceWrapper; // TODO: default values restore
                    // ['BaseLayout', 'Layout', 'NavigationDrawer', 'ComponentsLayout'].includes(name) &&
                    // console.log(['Reusing', name, key]);
                    instanceWrapper.isMounted = false;
                    instanceWrapper.attributes = tryCopyObjectList(attributes);
                    instanceWrapper.params = params;
                    if (instanceWrapper.component && lastSubscribers[instanceWrapper.component.__id]) {
                        subscribers[instanceWrapper.component.__id] = lastSubscribers[instanceWrapper.component.__id];
                    }
                }
            }
            // }
            var previousName = parentComponentName;
            parentComponentName = name;
            var page = $this.components[name];
            instanceWrapper = instanceWrapper || {
                component: null,
                name: name,
                isMounted: false,
                isCreated: false,
                params: params,
                hasVersions: page.hasVersions,
                isRoot: isRoot,
                rooted: (meta.parentInstance && meta.parentInstance.rooted) || (!isRoot && meta.level === 0 && meta.parentInstance && meta.parentInstance.isRoot && name),
                attributes: tryCopyObjectList(attributes),
                __id: ++nextInstanceId
            };
            // instanceWrapper.rooted && console.log(['rooted', name, instanceWrapper.rooted, meta.parentInstance.name, 'level', meta.level]);
            if (reuseEnabled && !instanceWrapper.key) {
                instanceWrapper.key = key;
            }
            var root = { isRoot: true };
            var newBuild = {
                root: root,
                versions: {},
                wrapper: instanceWrapper
            };
            if (page.hasVersions) {
                for (var ver in page.versions) {
                    newBuild.versions[ver] = build(page.versions[ver], instanceWrapper, childNodes, root, meta.level);
                    if (builtNodes) {
                        mergeNodes(newBuild.versions[ver], builtNodes.versions[ver]);
                    }
                }
            } else {
                newBuild.versions['main'] = build(page.nodes, instanceWrapper, childNodes, root, meta.level);
                if (builtNodes) {
                    mergeNodes(newBuild.versions['main'], builtNodes.versions['main']);
                }
            }
            for (var ver in newBuild.versions) {
                for (var i = 0; i < newBuild.versions[ver].length; i++) {
                    newBuild.versions[ver][i].root = true;
                }
            }
            // console.log(instance, newBuild, builtNodes, childNodes, attributes);
            parentComponentName = previousName;
            // if (parentComponentName === currentPage.name) {
            reuseEnabled ? currentPage.components.push({
                name: name,
                build: newBuild,
                instanceWrapper: instanceWrapper
            }) : currentPage.watchList.push(instanceWrapper);
            // }
            return newBuild;
        };

        var currentPage = {
            name: null,
            nodes: null,
            components: [],
            watchList: []
        };

        var latestPage = {
            name: null,
            nodes: null,
            components: [],
            watchList: []
        };

        var collectVirtual = function (node, vNodes) {
            if (node.children) {
                for (var c in node.children) {
                    if (node.children[c].domNode) {
                        vNodes.push(node.children[c]);
                    } else if (node.children[c].isVirtual) {
                        collectVirtual(node.children[c], vNodes);
                    }
                }
            }
        }
        var trimWhitespaceRegex = /^\s+|\s+$/;
        /**
         * 
         * @param {vNode} node 
         * @param {Node} domElement 
         */
        var hydrateDOM = function (node, domElement) {
            // nodeName - tag name
            // nodeType - 1 tag, 3 text, 8 comment
            // nodeValue for text and comment
            var same = node.domNode.nodeType === domElement.nodeType;
            if (same) {
                if (node.domNode.nodeType === 3 || node.domNode.nodeType == 8) {
                    same = node.domNode.nodeValue.replace(trimWhitespaceRegex, '') == domElement.nodeValue.replace(trimWhitespaceRegex, '');
                    if (same) {
                        node.domNode = domElement;
                    }
                } else if (node.domNode.nodeType === 1) {
                    // compare 1. tag name, 2.attributes, 3. children, 4. attach events
                    // 1. tag name
                    same = node.domNode.nodeName == domElement.nodeName;
                    if (same) {
                        /** 
                         * @type {HTMLElement}
                         */
                        var csrDomNode = node.domNode;
                        node.domNode = domElement;
                        if (!node.isVirtual && domElement && node.root && node.instance && node.instance.component) {
                            node.instance.component._element = domElement;
                        }
                        var s = 0; // shift for virtual nodes
                        var shiftDOM = 0; // shift for DOM children
                        var count = domElement.childNodes.length;
                        var maxNodes = node.children ? node.children.length : 0;
                        //if (count < maxNodes) {
                        if (node.children && node.children.length > 0) {
                            // normalize
                            if (
                                node.children[maxNodes - 1].domNode
                                && node.children[maxNodes - 1].domNode.nodeType === 3
                                && (domElement.childNodes.length == 0 || domElement.childNodes[count - 1].nodeType !== 3)
                                && /^\s*$/.test(node.children[maxNodes - 1].domNode.nodeValue)
                            ) {
                                // oldParent.removeChild(node.children[maxNodes - 1].domNode);
                                // node.children.splice(maxNodes - 1, 1);
                                // node.children[maxNodes - 2].nextNode = null;
                                domElement.appendChild(node.children[maxNodes - 1].domNode);
                            }

                            if (
                                node.children[0].domNode
                                && node.children[0].domNode.nodeType === 3
                                && domElement.childNodes[0].nodeType !== 3
                                && /^\s*$/.test(node.children[0].domNode.nodeValue)
                            ) {
                                // oldParent.removeChild(node.children[0].domNode);
                                // node.children.splice(0, 1);
                                // node.children[0].previousNode = null;
                                domElement.insertBefore(node.children[0].domNode, domElement.childNodes[0]);
                            }
                            maxNodes = node.children.length;
                            count = domElement.childNodes.length;
                        }
                        var nodesToRemove = [];
                        var vNodes = [];
                        for (var i = 0; i < maxNodes; i++) {
                            if (node.children[i].rawNodes) {
                                vNodes = vNodes.concat(node.children[i].rawNodes);
                            } else if (node.children[i].isVirtual) {
                                collectVirtual(node.children[i], vNodes);
                            } else {
                                vNodes.push(node.children[i]);
                            }
                        }
                        var vCount = vNodes.length;
                        for (var i = 0; i + shiftDOM < count; i++) {
                            while (i + s < vCount && !vNodes[i + s].domNode) { // TODO: support virtual nodes, dig deeper
                                s++;
                            }
                            if (i + s < vCount) {
                                if (vNodes[i + s].type) {
                                    var sameChild = hydrateDOM(vNodes[i + s], domElement.childNodes[i + shiftDOM]);
                                    if (!sameChild) {
                                        // try to find next match
                                        var foundNext = false;
                                        for (var ni = i + shiftDOM + 1; ni < count; ni++) {
                                            foundNext = hydrateDOM(vNodes[i + s], domElement.childNodes[ni]);
                                            if (foundNext) {
                                                // remove all not matched before
                                                for (var ri = i + shiftDOM; ri < ni; ri++) {
                                                    nodesToRemove.push(ri);
                                                }
                                                shiftDOM += ni - (i + shiftDOM);
                                                break;
                                            }
                                        }
                                        if (foundNext) {
                                            continue;
                                        }
                                        // reattach parent
                                        if (node.domNode !== vNodes[i + s].domNode.parentNode) {
                                            if (node.domNode.childNodes.length > i + shiftDOM) {
                                                node.domNode.replaceChild(vNodes[i + s].domNode, node.domNode.childNodes[i + shiftDOM]);
                                            } else {
                                                node.domNode.appendChild(vNodes[i + s].domNode);
                                            }
                                            hydrateDOM(vNodes[i + s], domElement.childNodes[i + shiftDOM]);
                                        } else {
                                            // two copies, remove one
                                            nodesToRemove.push(i);
                                        }
                                    }
                                } else {
                                    vNodes[i + s].domNode = domElement.childNodes[i + shiftDOM]; // TODO: compare attributes
                                }
                            } else {
                                // no more nodes to compare, remove dom element 
                                nodesToRemove.push(i + shiftDOM);
                            }
                        }
                        // append the rest of it
                        for (var i = count; i + s < vCount; i++) {
                            // can be null
                            if (vNodes[i + s].domNode) { // TODO: merge text nodes
                                node.domNode.appendChild(vNodes[i + s].domNode);
                            }
                        }
                        if (nodesToRemove.length > 0) {
                            // var oldTotal = node.children ? node.children.length : 0;
                            for (var k = nodesToRemove.length - 1; k >= 0; k--) {
                                var nodeIndex = nodesToRemove[k];
                                // if (nodeIndex < oldTotal) {
                                //     // replace
                                //     domElement.replaceChild(node.children[nodeIndex].domNode, domElement.childNodes[nodeIndex]);
                                // } else {
                                if (['BODY', 'HEAD'].includes(domElement.childNodes[nodeIndex].nodeName)) {
                                    // unexpected output from the server, replace rendered
                                    domElement.replaceChild(node.children.first(
                                        function (x) { return x.domNode.nodeName && x.domNode.nodeName === domElement.childNodes[nodeIndex].nodeName; }
                                    ).domNode, domElement.childNodes[nodeIndex]);
                                } else {
                                    domElement.removeChild(domElement.childNodes[nodeIndex]);
                                }
                                // }
                            }
                        }
                        count = domElement.childNodes.length;
                        if (count > vCount) {
                            for (var k = count - 1; k >= vCount; k--) {
                                domElement.removeChild(domElement.childNodes[k]);
                            }
                        }
                        if (vCount > count) {
                            for (var k = count; k < vCount; k++) {
                                if (vNodes[k].domNode && !vNodes[k].type) { // raw html from external js
                                    domElement.appendChild(vNodes[k].domNode);
                                }
                            }
                        }
                        // 4. attach events
                        if (node.attributes) {
                            for (var a in node.attributes) {
                                renderAttribute(node.domNode, node.attributes[a], true);
                            }
                        }
                        var csrAttributes = csrDomNode.getAttributeNames();
                        var ssrAttributes = node.domNode.getAttributeNames();
                        for (var attributeIndex = 0; attributeIndex < csrAttributes.length; attributeIndex++) {
                            var name = csrAttributes[attributeIndex];
                            var value = csrDomNode.getAttribute(name);
                            if (node.domNode.getAttribute(name) !== value) {
                                node.domNode.setAttribute(name, value);
                            }
                        }
                        // for (var attributeIndex = 0; attributeIndex < ssrAttributes.length; attributeIndex++) {
                        //     var name = ssrAttributes[attributeIndex];
                        //     if (!csrDomNode.hasAttribute(name)) {
                        //         // node.domNode.removeAttribute(name);
                        //     }
                        // }
                    }
                }
                if (node.domNode) {
                    node.domNode.usedByRenderer = true;
                }
            }
            return same;
        }

        var reuseEnabled = false;
        var scroll = false;

        var instantiateChildren = function (root) {
            if (root.childInstances) {
                for (var i in root.childInstances) {
                    createInstance(root.childInstances[i].wrapper);
                    mountInstance(root.childInstances[i].wrapper);
                    root.childInstances[i].root.childInstances
                        && instantiateChildren(root.childInstances[i].root);
                }
            }
        }

        var onRenderedTracker = {};
        var renderInProgress = false;
        var setAbort = false;
        var abortRender = false;
        var renderIteration = 0;

        this.runComponent = function (name, domSelector, params) {
            if (!started) {
                $this.start(function () {
                    $this.runComponent(name, domSelector, params);
                })
                return;
            }
            $this.render(name, params, false, domSelector);
        };

        this.render = function (name, params, force, domSelector) {
            if (!name) {
                throw new Error('Component name is required.');
            }
            if (!(name in $this.components)) {
                throw new Error('Component ' + name + ' doesn\'t exist.');
            }
            if ($this.components[name].lazyLoad) {
                var lazyLoadGroup = $this.components[name].lazyLoad;
                // lazy load the component
                var lazyGroupUrl = VIEWI_PATH + '/' + lazyLoadGroup + '.group.json' + VIEWI_VERSION;
                var resolvedSuccessfully = false;
                ajax.get(lazyGroupUrl)
                    .then(function (group) {
                        for (var componentName in group) {
                            delete $this.components[componentName]['lazyLoad'];
                            $this.components[componentName] = Object.assign($this.components[componentName], group[componentName]);
                            if (componentName === name) {
                                resolvedSuccessfully = true;
                            }
                        }
                        if (resolvedSuccessfully) {
                            // resume render
                            $this.render(name, params, force, domSelector);
                        } else {
                            console.error('Component "' + name + '" was not found in the group: ' + lazyGroupUrl);
                        }
                    }, function () {
                        console.error('Failed to lazy load the component in the group: ' + lazyGroupUrl);
                    });
                return;
            }
            onRenderedTracker = {};
            if (!force && exports[name] && exports[name]._beforeStart) {
                var middlewareList = exports[name]._beforeStart;
                if (middlewareList.length > 0) {
                    var mI = middlewareList.length - 1;
                    var middlewareName = middlewareList[mI];
                    /**
                     * @type {{run: (next: Function) => {}}}
                     */
                    var middleware = resolve(middlewareName);
                    var next = function () {
                        var runNext = arguments.length > 0 ? arguments[0] : true; // true by default
                        if (runNext) {
                            if (mI > 0) {
                                mI--;
                                middlewareName = middlewareList[mI];
                                middleware = resolve(middlewareName);
                                middleware.run(next);
                            } else {
                                $this.render(name, params, true, domSelector);
                            }
                        }
                    };
                    middleware.run(next);
                    return;
                }
            }
            if (renderInProgress) {
                setAbort = true;
            }
            var destroy = function () {
                for (var i = 0; i < latestPage.components.length; i++) {
                    var componentBuild = latestPage.components[i];
                    if (componentBuild.instanceWrapper
                        && componentBuild.instanceWrapper.component
                        && componentBuild.instanceWrapper.component.__destroy
                    ) {
                        componentBuild.instanceWrapper.component.__destroy();
                    }
                }
                for (var i = 0; i < latestPage.watchList.length; i++) {
                    var instanceWrapper = latestPage.watchList[i];
                    if (
                        instanceWrapper.component
                        && instanceWrapper.component.__destroy
                    ) {
                        instanceWrapper.component.__destroy();
                    }
                }
            };
            renderInProgress = true;
            reuseEnabled = false;
            if (!noRouter) {
                lastSubscribers = subscribers;
                subscribers = {};
            }
            renderQueue = {};
            parentComponentName = null;
            if (setAbort) {
                destroy();
            }
            latestPage = currentPage;
            currentPage = {};
            currentPage.name = name;
            currentPage.components = [];
            currentPage.watchList = [];
            var instanceMeta = create(name, null, null, params, true, { level: 0 });
            var nodes = instanceMeta.versions['main'];
            currentPage.nodes = nodes;
            cleanRender = !hydrate;
            // selector or HTML node
            var targetDOM = domSelector ? document.querySelector(domSelector) : document;
            if (!targetDOM) {
                throw new Error('Can\'t resolve target DOM node.');
            }
            var target =
                hydrate ?
                    (
                        domSelector ?
                            document.createElement(targetDOM.nodeName)
                            : { documentElement: document.createElement('html'), doctype: { childNodes: [] }, childNodes: hydrate ? [] : targetDOM.childNodes }
                    )
                    : targetDOM;

            createInstance(instanceMeta.wrapper);
            // console.log('renderInProgress, setAbort, abortRender', renderInProgress, setAbort, abortRender);
            // TODO: rewrite with cycle/recursion consideration
            if (abortRender) { destroy(); abortRender = false; return; }
            mountInstance(instanceMeta.wrapper);
            if (abortRender) { destroy(); abortRender = false; return; }
            instantiateChildren(instanceMeta.root);
            if (abortRender) { destroy(); abortRender = false; return; }
            destroy();
            renderIteration++;
            for (var nI = 0; nI < nodes.length; nI++) {
                nodes[nI].parent = {
                    domNode: target
                };
            }
            createDOM(target, {}, nodes, false);
            // hydrate && console.log(target);
            var nodeToHydrate = domSelector ? {
                children: nodes,
                domNode: targetDOM
            } : nodes[1];
            if (!nodeToHydrate && nodes[0].type === 'dynamic') {
                //              dynamic  template    html
                nodeToHydrate = nodes[0].children[0].children[1];
            }
            hydrate && hydrateDOM(nodeToHydrate, targetDOM.documentElement || targetDOM);
            for (var wrapperName in onRenderedTracker) {
                onRenderedTracker[wrapperName].component.__rendered
                    && onRenderedTracker[wrapperName].component.__rendered();
            }
            renderInProgress = false;
            if (setAbort) { // TODO: improve abort scenarios
                setAbort = false;
                abortRender = true;
            }
            onRenderedTracker = {};
            cleanRender = false;
            hydrate = false;
            if (scroll) {
                if (scrollTo) {
                    var toTarget = document.getElementById(scrollTo.substring(1));
                    toTarget && toTarget.scrollIntoView();
                } else {
                    window.scrollTo(0, 0);
                }
            }
            scroll = true;
        };

        this.htmlentities = function (html) {
            return html;
        }

        var encoder = document.createElement('div');

        this.decode = function (text) {
            encoder.innerHTML = text;
            return encoder.value;
        }
    };
    exports.Viewi = Viewi; // export
})(viewiExports, viewiBring);
(function (exports, bring) {
    // create an app
    var Viewi = bring('Viewi');
    var app = new Viewi();
    exports.viewiApp = app;
    exports.notify = app.notify;
    // register compiled components
    viewiBundleEntry(exports, bring);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { app.start(); });
    } else {
        // setTimeout(function () {
        //     app.start();
        // }, 1000);
        app.start();
    }
})(viewiExports, viewiBring);

