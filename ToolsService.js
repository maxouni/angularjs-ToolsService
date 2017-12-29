'use strict';

app.service('ToolsService', ['$q', '$http', function ($q, $http) {

	var ToolsService = {

		_process: false,

		/**
		 * Функция разбивает массив на столбцы
		 * @returns {*}
		 */
		arrayColumn: function (list, column, indice) {
			var result;

			if(typeof indice != "undefined"){
				result = {};

				for(var key in list)
					if(typeof list[key][column] !== 'undefined' && typeof list[key][indice] !== 'undefined')
						result[list[key][indice]] = list[key][column];
			}else{
				result = [];

				for(var key in list)
					if(typeof list[key][column] !== 'undefined')
						result.push( list[key][column] );
			}

			return result;
		},

		/**
		 * Pad a string to a certain length with another string
		 * original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		 * namespaced by: Michael White (http://crestidg.com)
		 * @param input
		 * @param pad_length
		 * @param pad_string
		 * @param pad_type
		 * @returns {*}
		 */
		str_pad: function( input, pad_length, pad_string, pad_type ) {

			var half = '', pad_to_go;

			var str_pad_repeater = function(s, len){
				var collect = '', i;

				while(collect.length < len) collect += s;
				collect = collect.substr(0,len);

				return collect;
			};

			if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') { pad_type = 'STR_PAD_RIGHT'; }
			if ((pad_to_go = pad_length - input.length) > 0) {
				if (pad_type == 'STR_PAD_LEFT') { input = str_pad_repeater(pad_string, pad_to_go) + input; }
				else if (pad_type == 'STR_PAD_RIGHT') { input = input + str_pad_repeater(pad_string, pad_to_go); }
				else if (pad_type == 'STR_PAD_BOTH') {
					half = str_pad_repeater(pad_string, Math.ceil(pad_to_go/2));
					input = half + input + half;
					input = input.substr(0, pad_length);
				}
			}

			return input;
		},

		/**
		 * Функция преобразует объект JS в строку параметров для Аякс
		 * Данные уходят POST
		 * @param obj
		 * @returns {string}
		 */
		toParam : function(obj) {
			if (!obj) return '';
			var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

			for(name in obj) {
				value = obj[name];

				if(value instanceof Array) {

					for(i=0; i<value.length; ++i) {
						query+= name+'='+value[i]+'&';
					}
				}
				else if(value instanceof Object) {
					for(subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += encodeURIComponent(fullSubName) + '=' + encodeURIComponent(subValue) + '&';
					}
				}
				else if(value !== undefined && value !== null)
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}

			return query.length ? query.substr(0, query.length - 1) : query;
		},

		/**
		 * Функция возвращает первое значение ключа объекта
		 * @param obj - объект
		 * @returns {string}
		 */
		getFirstKeyObj: function (obj) {
			for (var key in obj) return key;
		},

		/**
		 * Функция возвращает размер объекта
		 * @param obj - объект
		 * @returns {number}
		 */
		getObjSize: function (obj) {
			if (!obj) return false;
			var size = 0; for (var key in obj) size++; return parseInt(size, 10);
		},

		/**
		 * Функция подгружает картинку и делает resolve,
		 * когда она загружена.
		 * @param {string} srс - адрес картинки
		 * @returns {*}
		 */
		imagePreload: function (src) {

			var deffered = $q.defer();
			var image = new Image();
			image.src = window.location.protocol + '//' + window.location.hostname + src;

			if (image.complete) {
				deffered.resolve(image);
			} else {

				image.addEventListener('load', function() {
					deffered.resolve(image);
				});

				image.addEventListener('error', function() {
					deffered.reject();
				});
			}

			return deffered.promise;
		},

		/**
		 * Функция возвращает значение GET параметра по его имени
		 * @param name
		 * @param url
		 * @returns {*}
		 */
		getParameterUrlByName: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},

		/**
		 * Отправка ajax запроса на URL методом GET
		 * @param url
		 * @param method
		 * @param data
		 * @returns {*|promise}
		 */
		ajax: function (url, method, data) {
			/**
			 * Прерыватель ajax. Резолв переводит переменную в
			 * состояние завершености, поэтому таймер в ajax становится нулевым
			 * и запрос прерывается по таймауту
			 */
			if (this._process) {
				this._process.resolve();
			}
			this._process = $q.defer();

			var result = $q.defer();

			$http({
				method: method,
				cache: false,
				timeout: this._process.promise,
				data: ToolsService.toParam(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				url: url
			}).then(function successCallback(response) {
				result.resolve(response);
			}, function errorCallback(response) {
				result.resolve(response);
			});

			return result.promise;
		}

	};

	return ToolsService;
}]);
