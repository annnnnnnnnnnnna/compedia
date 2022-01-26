function makeQuestion(random) {
    getOrigin(random, '');
}
function getOrigin(random, param) {
    if (param == '') {
        param = "&pageids=" + random.nextInt(10000, 1000000);
    }
    $.getJSON("https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=links&pllimit=500&origin=*" + param, function (json){
        let title = '';
        for (const page in json.query.pages) {
            if (json.query.pages[page].title) {
                title = json.query.pages[page].title;
                $('#origin')[0].value = title;
                for (const link in json.query.pages[page].links) {
                    if (json.query.pages[page].links[link].ns == 0) {
                        $('#nextList').append($('<option>').html(json.query.pages[page].links[link].title).val(json.query.pages[page].links[link].title));
                    }
                }
            }
        }
        if (title == '') {
            getOrigin(random, '');
        } else if (json.continue && json.continue.plcontinue) {
            getOrigin(random, param + '&plcontinue=' + json.continue.plcontinue);
        } else {
            getDestination(random);
        }
    });
}

function getDestination(random) {
    let param = "&pageids=" + random.nextInt(10000, 1000000);
	$.getJSON("https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=links&pllimit=500&origin=*"+param, function (json){
        let title = '';
	    for (const page in json.query.pages) {
            if (json.query.pages[page].title) {
                title = json.query.pages[page].title;
        	    $('#destination')[0].value = title;
            }
	    }
        if (title == '') {
            getDestination(random);
        }
	});
}

function getLinksByTitle(title, plcontinue){
	$.getJSON("https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=links&pllimit=500&origin=*&titles="+title+plcontinue, function (json){
        for (const page in json.query.pages) {
            for (const link in json.query.pages[page].links) {
                if (json.query.pages[page].links[link].ns == 0) {
                    $('#nextList').append($('<option>').html(json.query.pages[page].links[link].title).val(json.query.pages[page].links[link].title));
                }
            }
        }
        if (json.continue && json.continue.plcontinue) {
            getLinksByTitle(title, '&plcontinue=' + json.continue.plcontinue);
        }
	});
}
function today() {
    const today = new Date();
    const seed = ("" + today.getFullYear() + (today.getMonth()+10) + today.getDate()) * 1;
    const random = new Random(seed);
    if ($('#origin')[0].value != seed) {
        makeQuestion(random);
        $('#seed')[0].value = seed;
    }
}

class Random {
  constructor(seed = 88675123) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed;
  }

  // XorShift
  next() {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
  }

  // min 以上 max 以下の乱数を生成する
  nextInt(min, max) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}

function shot() {
    const selectItem = $('#nextList').val();
    $('#nextList > option').remove();
    if (selectItem == $('#destination')[0].value) {
    } else {
        $('#prevList').append($('<option>').html(selectItem).val(selectItem));
        getLinksByTitle(selectItem, '');
    }
}
