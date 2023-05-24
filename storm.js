var storm = storm || new Storm();

function Storm() {
    var currentCity = 0;
    const chartX = 165;
    const chartY = 50;
    const chartWidth = 324;
    const chartHeight = 210;
    const summer = 'yellow';
    const spring = '#00ff00';
    const winter = 'gray';
    const cityStore = 'cityStore';
    const imgX = 2;
    const imgY = 2;
    const imgWidth = 130;
    const imgHeight = 90;
    const barWidth = 22;
    const tstormX = 20;
    const precipX = 70;
    const snowX = 120;
    const seasonX = chartX + 155;
    const seasonWidth = 70;
    const seasonHeight = 20;
    const winterY = chartY + chartHeight + 50;
    const springY = winterY + 30;
    const summerY = springY + 30;
    const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.init = function() {
        const myCanvas = $("#myCanvas");
        this.layer = $("#myLayer");
        this.width = myCanvas.width();
        this.height = myCanvas.height();
        var self = this;
        $("#previous").click(function() {
            self.previous();
        });
        $("#next").click(function() {
            self.next();
        });
        $(document).keydown(function(event) {
            if (document.activeElement != $('#cities')[0]) {
                if (event.which == 37) {
                    self.previous();
                }
                else if (event.which == 39) {
                    self.next();
                }
                else {
                    for (var i = 0; i < stats.length; i++) {
                        if (stats[i].name.charCodeAt(0) == event.which) {
                            currentCity = i;
                            self.show();
                            break;
                        }
                    }
                }
                self.layerMove();
            }
        });
        this.initPicklist();
        this.initLayer();
        var name = localStorage.getItem(cityStore);
        if (!name) {
            name = "Los Angeles";  // default
        }

        var imgCity = $('#imgCity');
        imgCity.error(function(evt) {
            console.error("Unable to load " + evt.currentTarget.src);
            imgCity.attr('src', "1x1.png");
        });

        $('#links a').click(function(event) {
            event.preventDefault(); // Prevent default link behavior
            var url = $(this).attr('href');
            window.open(url, '_blank');
        });

        this.setCity(name);

        this.preload();
    }

    this.preload = function() {
        images = [];
        for (var idx in stats) {
            var city = stats[idx];
            if (city.img) {
                images.push(city.img);
            }
        }

        $(images).each(function(){
            $('<img/>')[0].src = this;
        });
    }

    this.initLayer = function() {
        var self = this;

        this.layer.mousemove(function(event) {
            self.mousex = event.offsetX;
            self.mousey = event.offsetY;
            self.layerMove();
        });

        this.layer.mouseout(function(event) {
            self.mousex = 0;
            self.mousey = 0;
            self.layer[0].getContext("2d").clearRect(0, 0, self.layer.width(), self.layer.height());
            $('.tooltip').css('visibility', 'hidden');
        });
    }

    this.layerMove = function() {
        var x = this.mousex;
        var y = this.mousey;
        var ctx = this.layer[0].getContext("2d");
        var city = stats[currentCity];
        ctx.clearRect(0, 0, this.layer.width(), this.layer.height());

        if (x > chartX && x < (chartX + chartWidth) && y > chartY && y < (chartY + chartHeight)) {
            var monthWidth = chartWidth / city.precip.length;
            var month = Math.floor((x - chartX - 5) / monthWidth);
            month = month < 0 ? 0 : month;
            var precip = (Math.floor((city.precip[month] + .005) * 100) / 100).toFixed(2);
            var xPos = 20;
            var yPos = chartY - 15;
            ctx.font = "bold 14px Verdana";
            ctx.fillStyle = 'black';
            ctx.fillText(months[month], xPos, yPos);
            ctx.font = "14px Verdana";
            yPos += 20;
            ctx.fillText(city.high[month] + "° / " + city.low[month] + "°", xPos, yPos);
            yPos += 20;
            ctx.fillText(precip + '" precip', xPos, yPos);

            ctx.lineWidth = 3.0;
            ctx.strokeStyle = 'indianred';
            ctx.beginPath();
            x = chartX + monthWidth * month + (monthWidth / 2);
            ctx.moveTo(x, chartY);
            ctx.lineTo(x, chartY + chartHeight);
            ctx.stroke();
        }
        else {
            var show = false;
            var html = "";

            if (y > winterY) {
                if (x > tstormX && x < (tstormX + barWidth)) {
                    html = "Average annual number of days with thunderstorms";
                    show = true;
                }
                else if (x > precipX && x < (precipX + barWidth)) {
                    html = "Average annual inches of precipitation";
                    show = true;
                }
                else if (x > snowX && x < (snowX + barWidth)) {
                    html = "Average annual inches of snow";
                    show = true;
                }
                else if (x > chartX && x < seasonX) {
                    show = true;                        
                    if (y < winterY + 20) {
                        html = "Average annual number of days when temperature is 32 degrees or lower";
                    }
                    else if (y < winterY + 40) {
                        html = "Average annual number of days when temperature is 90 degrees or higher";
                    }
                    else if (y < winterY + 60) {
                        html = "Average annual number of cloudy days";
                    }
                    else if (y < winterY + 80) {
                        html = "Average annual number of partly cloudy days";
                    }
                    else if (y < winterY + 100) {
                        html = "Average annual number of clear days";
                    }
                    else {
                        show = false;
                    }
                }
                else if (x > seasonX && x < (seasonX + seasonWidth)) {
                    if (y < (winterY + seasonHeight)) {
                        html = "Average daily low temperature is below 32&deg;"
                        show = true;
                    }
                    else if (y > springY && y < (springY + seasonHeight)) {
                        html = "Daily low temperature is above 32&deg and daily mean below 60&deg;";
                        show = true;
                    }
                    else if (y > summerY && y < (summerY + seasonHeight)) {
                        html = "Average daily mean temperature is above 60&deg;";
                        show = true;
                    }
                }
                else if (x > (seasonX + seasonWidth) && x < (seasonX + seasonWidth + 140)) {
                    html = this.getSeason("Winter", city.winter) + this.getSeason("Summer", city.summer);
                    show = true;
                }
            }

            $('.tooltip').css('visibility', show ? "visible" : "hidden");
            $('.tooltiptext').html(html);
        }
    }

    this.getSeason = function(name, season) {
        if (season && season.length == 4 && season[0] > 0) {
            if (!(season[0] == season[2] && season[1] == season[3])) {
                return name + ": " + season[0] + "/" + season[1] + " - " + season[2] + "/" + season[3] + "  ";
            }
        }
        return "";
    },

    this.initPicklist = function() {
        var self = this;
        var cities = $('#cities');

        for (var i = 0; i < stats.length; i++) {
            var name = stats[i].name;
            var option = document.createElement('option');
            option.setAttribute('value', name);
            option.appendChild(document.createTextNode(name));
            cities.append(option);
        }

        cities.change(function(event) {
            self.setCity(event.target.value);
            self.show();
        });
    }

    this.setCity = function(name) {
        if (name) {
            for (var i = 0; i < stats.length; i++) {
                if (stats[i].name.includes(name)) {
                    currentCity = i;
                    break;
                }
            }            
        }
    }

    this.previous = function() {
        currentCity--;
        if (currentCity < 0) {
            currentCity = stats.length - 1;
        }
        this.show();                    
    }

    this.next = function() {
        currentCity++;
        if (currentCity >= stats.length) {
            currentCity = 0;
        }
        this.show();
    }

    this.numberWithCommas = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    this.show = function() {
        var city = stats[currentCity];
        var cities = $('#cities');
        cities.val(city.name);
        localStorage.setItem(cityStore, city.name);
        document.title = city.name;
        var canvas = document.getElementById("myCanvas");
        var pop = city.pop ? " pop.: " + this.numberWithCommas(city.pop) : "";
        this.ctx = canvas.getContext("2d");
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.chart(city);
        this.ctx.font = "14px Verdana";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(city.name + " (" + city.elev + "')" + pop, chartX + 5, chartY - 26);
        
        var txt = (currentCity + 1) + "/" + stats.length;
        var width = this.ctx.measureText(txt).width;
        this.ctx.fillText(txt, this.layer.width() - width - 10, this.layer.height() - 20);
        this.displayImage(city);

        var info = city.info ? city.info : "";
        $('#info').text(info);

        var map = $('#mapUrl');
        var wiki = $('#wikiUrl');
        if (info) {
            map.css('display','block');
            map.attr('href', 'https://www.google.com/maps/place/' + city.name.replaceAll(' ','+'));
            wiki.css('display','block');
            wiki.attr('href', 'https://en.wikipedia.org/wiki/' + city.name.replaceAll(' ','_'));
        }
        else {
            map.css('display','none');
            map.attr('href', '');
            wiki.css('display','none');
            wiki.attr('href', '');
        }
    }

    this.displayImage = function(city) {
        var imgCity = $('#imgCity');
        if (city.img) {
            imgCity.attr('src', city.img);
        }
        else {
            imgCity.attr('src', "1x1.png");
        }

        var imgUrl = $('#imgUrl');
        if (city.url) {
            imgUrl.attr('href', city.url);
            imgUrl.css('pointer-events', 'auto');
        }
        else {
            imgUrl.attr('href', '');
            imgUrl.css('pointer-events', 'none');
        }
    }

    this.chart = function(city) {
        var chartLines = 7;
        var segHeight = chartHeight / chartLines;
        var monthWidth = chartWidth / city.precip.length;
        this.ctx.strokeStyle = "#c3c3c3";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
        this.ctx.beginPath();

        for (var i = 1; i < chartLines; i++) {
            var yPos = chartY + (i * segHeight);
            this.ctx.moveTo(chartX, yPos);
            this.ctx.lineTo(chartX + chartWidth, yPos);
            this.ctx.stroke();
        }

        // Precip labels
        this.ctx.font = "12px Verdana";
        var x = chartX - 8;
        var y = chartY + 4;
        for (var inches = 14; inches >= 0; inches -= 2) {
            var width = this.ctx.measureText(inches).width;
            this.ctx.fillText(inches + '"', x - width, y);
            y += segHeight;
        }

        // Temp labels
        x = chartX + chartWidth + 28;
        y = chartY + 4;
        for (var temp = 120; temp >= -20; temp -= 20) {
            var width = this.ctx.measureText(temp).width;
            this.ctx.fillText(temp + "°", x - width, y);
            y += segHeight;
        }

        // Month labels
        x = chartX + 4;
        y = chartY + chartHeight + 16;
        for (var i = 0; i < months.length; i++) {
            var month = months[i];
            this.ctx.fillText(month, x, y);
            x += monthWidth;
        }

        // 12 precips
        x = chartX + 4;
        y = chartY + chartHeight;
        this.ctx.fillStyle = '#0000ff90';
        for (var i = 0; i < months.length; i++) {
            var precip = city.precip[i] * 15;
            this.ctx.fillRect(x, y - precip, 20, precip);
            x += monthWidth;
        }

        // High temperatures
        x = chartX + 12;
        this.ctx.lineWidth = 3.0;
        this.ctx.strokeStyle = 'orange';
        this.ctx.beginPath();
        for (var i = 0; i < months.length; i++) {
            var temp = (city.high[i] + 20) * 3 / 2;
            y = chartY + chartHeight - temp;
            this.ctx.lineTo(x, y);
            x += monthWidth;
        }
        this.ctx.stroke();

        // Low temperatures
        x = chartX + 12;
        this.ctx.strokeStyle = 'lightblue';
        this.ctx.beginPath();
        for (var i = 0; i < months.length; i++) {
            var temp = (city.low[i] + 20) * 3 / 2;
            y = chartY + chartHeight - temp;
            this.ctx.lineTo(x, y);
            x += monthWidth;
        }
        this.ctx.stroke();

        // Pie chart
        x = chartX + chartWidth - 30;
        y = chartY + chartHeight + 90;
        var radius = 35;

        // Pie hash marks
        this.ctx.beginPath();
        var r = radius + 3;
        for (var deg = 0; deg < 180; deg += 30) {
            var radians = Math.PI * deg / 180;
            var x1 = x + r * Math.cos(radians);
            var y1 = y + r * Math.sin(radians);
            var x2 = x - r * Math.cos(radians);
            var y2 = y - r * Math.sin(radians);
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
        }
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();

        // Seasons
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        if (city.summer[0] < 0 && city.winter[0] < 0) {
            this.ctx.fillStyle = 'white';
        }
        else {
            this.ctx.fillStyle = spring;
        }
        this.ctx.fill();
        this.drawSeason(x, y, radius, city.summer, summer);
        this.drawSeason(x, y, radius, city.winter, winter);

        // Pie chart outline
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();

        // Month labels
        this.ctx.fillText(months[0], x - 10, y - radius - 6);
        this.ctx.fillText(months[3], x + radius + 6, y + 4);
        this.ctx.fillText(months[6], x - 9, y + radius + 14);
        this.ctx.fillText(months[9], x - radius - 25, y + 4);

        // Season legend
        x = seasonX;
        this.ctx.font = "11px Verdana";
        this.drawSeasonLegend("Winter", winter, x, winterY);
        this.drawSeasonLegend("Spring/Fall", spring, x, springY);
        this.drawSeasonLegend("Summer", summer, x, summerY);

        // T-Storm Precip Snow
        this.tps(city);

        // Table
        x = chartX + 5;
        y = chartY + chartHeight + 60;
        this.ctx.font = "12px Verdana";
        this.ctx.fillStyle = 'black';
        this.drawTable("Freeze Days", city.freeze, x, y);
        y += 20;
        this.drawTable("90 Degree Days", city.hot, x, y);
        y += 20;
        this.drawTable("Cloudy", city.cloudy, x, y);
        y += 20;
        this.drawTable("Partly Cloudy", city.ptCloudy, x, y);
        y += 20;
        this.drawTable("Clear", city.clear, x, y);
    }

    this.drawSeasonLegend = function(name, color, x, y) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, seasonWidth, seasonHeight);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.rect(x, y, seasonWidth, seasonHeight);
        this.ctx.stroke();
        this.ctx.fillStyle = color == winter ? 'white' : 'black';
        this.ctx.fillText(name,  x + 5, y + 14);        
    }

    this.drawTable = function(name, value, x, y) {
        this.ctx.fillText(name + ":" ,  x, y);
        if (value < 0) {
            value = "N/A";
        }
        x = x + 130 - this.ctx.measureText(value).width;
        this.ctx.fillText(value, x, y);
    }

    // T-storm Precip Snow
    this.tps = function(city) {
        this.ctx.font = "11px Verdana";

        var precip = 0;
        for (var i = 0; i < city.precip.length; i++) {
            precip += city.precip[i];
        }

        // Round precip to hundredths:
        precip = (Math.floor((precip + .005) * 100) / 100).toFixed(2);

        var base = this.height - 35;
        this.drawBar("T-Storms", "#ff0000c0", tstormX, base, city.tstorms);
        this.drawBar("Precip", "#0000ff90", precipX, base, precip);
        this.drawBar("Snow", "gray", snowX, base, city.snow);
    }

    this.drawBar = function(name, color, x, y, height) {
        var centerX = x + barWidth / 2;
        var value = height >= 0 ? height : "N/A";
        height = height >= 0 ? height : 0;

        if (height > 0) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y - height, barWidth, height);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'black';
            this.ctx.rect(x, y - height, barWidth, height);
            this.ctx.stroke();
        }

        var xPos = centerX - this.ctx.measureText(name).width / 2;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(name, xPos, y + 15);
        xPos = centerX - this.ctx.measureText(value).width / 2;
        this.ctx.fillText(value,  xPos, y - height - 8);
    }

    this.drawSeason = function(x, y, radius, season, color) {
        var stAngle = this.getAngle(season[0], season[1]);
        var enAngle = this.getAngle(season[2], season[3]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, stAngle, enAngle, false);
        this.ctx.lineTo(x, y);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    this.getAngle = function(month, day) {
        var degrees = (month - 4) * 30 + day;
        return Math.PI * degrees / 180.0;
    }
}
