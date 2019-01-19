/**
 * @authors Mzong(mzong121491@gmail.com)
 * @date    2019-01-18 11:15
 * @requires  layui
 * @version $1.1.0$
 */
layui.define("layer", function(exports){ 
	//提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
	var $ = layui.jquery,
		form = layui.form;
	// 返回的对象
	var returnObj = {	
		/**
		 * 省市县三级联动
		 *
		 * @param { string } [form] [form是layui.form对象]
		 * @param {string} [province] [省容器的name名字 ]
		 *    eg:<select name="province">
		 * @param {string} [city] [省容器的name名字]
		 * @param {string} [district] [县容器的name名字]
		 * @return {undefined} [无返回值]
		 */
		showCity: function(province, city, district) {
			//AreaData是地址传过来的json对象
			var AreaData = $.rawCitiesData;
			if("undefined" == typeof AreaData) {
				layer.open({
					title: '系统提示'
					,content: '调用showCity之前请引入地址数据'
				}); 
				return;
			}
			var htmlProvince = '',
				htmlCity = '',
				htmlDistrict = '',
				cityData = '',
				districtData = '',
				$province = $('select[name='+province+']'),
				$city = $('select[name='+city+']'),
				$district = $('select[name='+district+']'),
				provVal = $province.attr('data-area') || '', // 省默认值
				cityVal = $city.attr('data-area') || '', // 市默认值
				distVal = $district.attr('data-area') || ''; // 县默认值
			$province.find('option').not(':first').remove();
			$city.find('option').not(':first').remove();
			$district.find('option').not(':first').remove();
			form.render('select');

			// 加载省数据
			loadProvince();
			function loadProvince() {
				AreaData.forEach(function(v, i) {
					htmlProvince += '<option value='+v.code+'>'+v.name+'</option>';
				});
				$province.append(htmlProvince);

				// 默认选中省
				defaultSelect($province, provVal, function(code) {
					cityData = findPlace(AreaData, code);
					loadCity(cityData, true);
				});

				form.render('select');

			}

			// 加载城市数据
			function loadCity(city, hasDefault) {
				$city.find('option').not(':first').remove();
				htmlCity = '';
				var city = city || [];
				city.forEach(function(v, i) {
					htmlCity += '<option value='+v.code+'>'+v.name+'</option>';
				});
				$city.append(htmlCity);

				// 默认加载才执行，手动选中不执行
				if (hasDefault) {
					// 默认选中城市
					defaultSelect($city, cityVal, function(code) {
						// console.log(code)
						// 加载默认城市数据
						districtData = findPlace(cityData, code);
						loadDistrict(districtData, true);
					});
				}

				form.render('select');
			}

			// 加载县数据
			function loadDistrict(districtData, hasDefault) {
				$district.find('option').not(':first').remove();
				htmlDistrict = '';
				var districtData = districtData || [];
				districtData.forEach(function(v, i) {
					htmlDistrict += '<option value='+v.code+'>'+v.name+'</option>';
				});
				$district.append(htmlDistrict);

				if (hasDefault) {
					// 默认选中县
					defaultSelect($district, distVal);
				}

				form.render('select');
			}

			// 查找地点数据
			function findPlace(data, code) {
				var resData = [];
				data.forEach(function(v, i) {
					if (v.code === code) {
						resData = v.sub
					}
				});

				return resData;
			}

			/* 
			* 查找默认选中项
			* @param {object} jq元素
			* @param {string} 默认值
			* @param {function} 回调函数
			*/ 
			function defaultSelect($el, SelectVal, callback) {
				$('option', $el).each(function(i, el) {
					var $this = $(this);
					var optVal = $this.html();
					var code;
					if (optVal == SelectVal) {
						$this.attr("selected", true);
						code = $this.val();
						// 加载默认城市数据
						callback && callback(code);
					}
				});
			}

			// 省选择
			form.on('select('+province+')', function(data) {
				var code = data.value;
				// console.log(data.elem); //得到select原始DOM对象
				// console.log(code); //得到被选中的值
				if (code != '') {

					cityData = findPlace(AreaData, code);

					loadCity(cityData);
					loadDistrict();

				} else {
					loadCity();
					loadDistrict();
				}
				// console.log(data.othis); //得到美化后的DOM对象
			});
			// 市选择
			form.on('select('+city+')', function(data){
				var code = data.value;
				if (code != '') {

					districtData = findPlace(cityData, code);

					loadDistrict(districtData);
					// console.log(data.elem); //得到select原始DOM对象
				} else {
					loadDistrict();
				}
				// console.log(data.othis); //得到美化后的DOM对象
			});
			form.on('select('+district+')', function(data){
				// console.log(data.elem); //得到select原始DOM对象
				// console.log(data.value); //得到被选中的值
				// console.log(data.othis); //得到美化后的DOM对象
			});
		},
		/**
		 * 获取省市县数据
		 *
		 * @param { object } [address] [address eg:广东省广州市天河区]
		 * @return {object} [address][根据code码返回地址名称]
		 */
		getCity: function(address) {
			//AreaData是地址传过来的json对象
			var AreaData = $.rawCitiesData;
			if("undefined" == typeof AreaData) {
				layer.open({
					title: '系统提示'
					,content: '调用getCity之前请引入地址数据'
				}); 
				return;
			}
			var province = address.province,
				city = address.city,
				district = address.district,
				provinceName = '',
				cityName = '',
				districtName = '';

			function findIndex(arr, target) {
				return arr.findIndex(function(v, i) {
					return target == v.code;
				})
			}

			if (province) {
				var findProvinceIndex = findIndex(AreaData, province);
				provinceName = AreaData[findProvinceIndex].name;
			}

			if (province && city) {
				var findCityIndex = findIndex(AreaData[findProvinceIndex].sub, city);
				cityName = AreaData[findProvinceIndex].sub[findCityIndex].name;
			}

			if (province && city && district) {
				var findDistrictIndex = findIndex(AreaData[findProvinceIndex].sub[findCityIndex].sub, district);

				districtName = AreaData[findProvinceIndex].sub[findCityIndex].sub[findDistrictIndex].name;
			}

			return {
				provinceName: provinceName,
				cityName: cityName,
				districtName: districtName
			}
		}
	} 

	// exports module
	exports('common', returnObj);
});
