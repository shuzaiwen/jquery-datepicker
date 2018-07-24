(function(win, factory) {
    factory.call(win, win.jQuery);
})(window, function($) {

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}

	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}

    function Datepicker(element, options) {

        this.isShow = false;
        this.element = $(element);
        this.defaults = {
            format:'yyyy/mm/dd'
        };

        this.options = $.extend({}, this.defaults, options);
        this.viewDate = UTCToday();
        this.picker = $(DPGlobal.templete);
        this.render();
        this._buildEvents();
        this._attachEvents();

    }

    Datepicker.prototype = {
        constructor: Datepicker,

        getMonthData: function() {
            var ret = [];
            
            var year = this.viewDate.getFullYear(),
            	month = this.viewDate.getMonth() + 1;

            var firstDay = new Date(year, month - 1, 1); //本月第一天
            var firstDayWeekDay = firstDay.getDay(); //本月第一天是星期几
            if (firstDayWeekDay === 0) firstDayWeekDay = 7;

            year = firstDay.getFullYear();
            month = firstDay.getMonth() + 1;

            var lastDayOfLastMonth = new Date(year, month - 1, 0);
            var lastDateOfLastMonth = lastDayOfLastMonth.getDate();

            var preMonthDayCount = firstDayWeekDay - 1; //本月第一天之前有几天

            var lastDay = new Date(year, month, 0);
            var lastDate = lastDay.getDate();

            var fillFirstDay = new Date(year, month - 1, 1 - preMonthDayCount);
            //console.log(fillFirstDay);
            for (var i = 0; i < 7 * 6; i++) {
                var date = i + 1 - preMonthDayCount;
                var getTime= fillFirstDay.getTime()+28800000;
                //console.log(fillFirstDay);
                var showDate = date;
                var thisMonth = month;

                if (date <= 0) {
                    // 上一个月
                    thisMonth = month - 1;
                    showDate = lastDateOfLastMonth + date;
                } else if (date > lastDate) {
                    //下一个月
                    thisMonth = month + 1;
                    showDate = showDate - lastDate;
                }

                if (thisMonth === 0) thisMonth = 12;
                if (thisMonth === 0) thisMonth = 1;

                ret.push({
                    month: thisMonth,
                    date: date,
                    showDate: showDate,
                    getTime:getTime
                });

                fillFirstDay.setDate(fillFirstDay.getDate() + 1);
            }

            return {
                year: year,
                month: month,                
                days: ret
            };
        },

        // _buildUI: function() {
        //     //var monthData = this.getMonthData();

        //     var html = '<div class="ui-datepicker-wrapper">' +
        //         '<div class="ui-datepicker-header">' +
        //         '<a href="#" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</a>' +
        //         '<a href="#" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>' +
        //         '<span class="ui-datepicker-curr-month"></span>' +
        //         '</div>' +
        //         '<div class="ui-datepicker-body">' +
        //         '<table>' +
        //         '<thead>' +
        //         '<tr>' +
        //         '<th>一</th>' +
        //         '<th>二</th>' +
        //         '<th>三</th>' +
        //         '<th>四</th>' +
        //         '<th>五</th>' +
        //         '<th>六</th>' +
        //         '<th>日</th>' +
        //         '</tr>' +
        //         '</thead>' +
        //         '<tbody></tbody>' +
        //         '</table>' +
        //         '</div>' +
        //         '</div>';

        //     return html;
        // },
        render: function(direction){
        	var d = new Date(this.viewDate),
        		year = d.getUTCFullYear(),
        		month = d.getUTCMonth(),
        		monthData = this.getMonthData(),
        		bodyhtml = this.getBodyHtml(monthData);
        	

               	this.picker.find('.ui-datepicker-curr-month').text(year+'-'+(month+1));
               	this.picker.find('tbody').html(bodyhtml);

        },
        _buildEvents: function() {
            // var that = this;
            // this.element.on('focus', $.proxy(this.show, this));

            // this.element.on('blur', $.proxy(this.show, this));

            var events = {
            	'focus':$.proxy(this.show, this)
            };

            this._events = [
            	[this.element,events]
            ];

            this._pickerEvents = [
    //         	[this.picker, {
				// 	click: $.proxy(this.click, this)
				// }],
				[this.picker, '.ui-datepicker-prev-btn, .ui-datepicker-next-btn', {
					click: $.proxy(this.navArrowsClick, this)
				}],
				[this.picker, '.day:not(.disabled)', {
					click: $.proxy(this.dayCellClick, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e){
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length ||
							this.isInline
						)){
							this.hide();
						}
					}, this)
				}]
            ]
            
        },
        _attachEvents: function(){
        	this._detachEvents();
			this._applyEvents(this._events);
        },
        _applyEvents: function(evs){
        	for (var i=0, el, ch, ev; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
        },
        _detachEvents: function(){
			this._unapplyEvents(this._events);
		},
        _unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_attachPickerEvents: function(){
			this._detachPickerEvents();
			this._applyEvents(this._pickerEvents);
		},
		_detachPickerEvents: function(){
			this._unapplyEvents(this._pickerEvents);
		},
        show: function() {
            this.picker.appendTo('body');
            this.place();
            this.picker.show();
            this._attachPickerEvents();
            //this._buildPickerEvents();
        },
        hide: function() {
            this.picker.hide().detach();
        },
        place: function() {
            var appendOffset = $("body").offset();

            var offset = this.element.offset();
            var height = this.element.outerHeight(false);
            var width = this.element.outerWidth(false);
            var left = offset.left - appendOffset.left;
            var top = offset.top - appendOffset.top;
            top += height;

            this.picker.css({
                top: top,
                left: left,
                // zIndex: zIndex
            });
        },
        dayCellClick: function(e){
        	var $target = $(e.currentTarget);
        	var timestamp = $target.data('date');
			var date = new Date(timestamp);
			
			this._setDate(date);
        },
        navArrowsClick:function(e){
        	var $target = $(e.currentTarget);
			var dir = $target.hasClass('ui-datepicker-prev-btn') ? -1 : 1;
			// if (this.viewMode !== 0){
			// 	dir *= DPGlobal.viewModes[this.viewMode].navStep * 12;
			// }
			this.viewDate = this.moveMonth(this.viewDate, dir);

			this.render();
        },
        _setDate: function(date){
        	console.log(date);
        	var formattedDate = this.getFormattedDate(date);
        	this.element.val(formattedDate);
        },
        getFormattedDate: function(date){
        	var format = this.options.format;
        	return DPGlobal.formatDate(date,format);
        },
        moveMonth: function(date, dir){
        	console.log(date);
			// if (!isValidDate(date))
			// 	return this.o.defaultViewDate;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1){
				test = dir === -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){
						return new_date.getUTCMonth() === month;
					}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){
						return new_date.getUTCMonth() !== new_month;
					};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				new_month = (new_month + 12) % 12;
			}
			else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},
		getBodyHtml: function(monthData){
			
			var html,
				thisMonth = monthData.month;
			for (var i = 0; i < monthData.days.length; i++) {
                var date = monthData.days[i];
                if (i % 7 === 0) {
                    html += '<tr>';
                }
                if(date.month === thisMonth){
                	html += '<td class="day" data-date="'+date.getTime+'">' + date.showDate + '</td>';
                }else{
                	html += '<td class="old day" data-date="'+date.getTime+'">' + date.showDate + '</td>';
                }
                
                

                if (i % 7 === 6) {
                    html += '</tr>';
                }
            }
            return html;
		}
    };

    var DPGlobal = {
    	templete:'<div class="ui-datepicker-wrapper">' +
                '<div class="ui-datepicker-header">' +
                '<a href="#" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</a>' +
                '<a href="#" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>' +
                '<span class="ui-datepicker-curr-month"></span>' +
                '</div>' +
                '<div class="ui-datepicker-body">' +
                '<table>' +
                '<thead>' +
                '<tr>' +
                '<th>一</th>' +
                '<th>二</th>' +
                '<th>三</th>' +
                '<th>四</th>' +
                '<th>五</th>' +
                '<th>六</th>' +
                '<th>日</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody></tbody>' +
                '</table>' +
                '</div>' +
                '</div>',
    	formatDate: function(date, format){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			
            var val = {
				d: date.getUTCDate(),
				// D: dates[language].daysShort[date.getUTCDay()],
				// DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				// M: dates[language].monthsShort[date.getUTCMonth()],
				// MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};

			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			console.log(seps,format.parts);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++){
				if (seps.length)date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		parseFormat: function(format){
			if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
                return format;
            // IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			console.log(format);
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("无效的日期格式.");
			}
			return {separators: separators, parts: parts};
		},
    };


    $.fn['datepicker'] = function(options) {
        this.each(function(i, obj) {
            new Datepicker(this, options);
        });
    };

});