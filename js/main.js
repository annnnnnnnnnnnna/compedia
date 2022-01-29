function makeQuestion(random) {
    getOrigin(random, '', '');
}
function getOrigin(random, param, param2) {
    if (param == '') {
        param = '&generator=random&grnnamespace=0';
//        param = "&pageids=" + random.nextInt();
    }
    $.getJSON("https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=links&pllimit=500&redirects=true&origin=*" + param, function (json){
        let title = '';
        for (const page in json.query.pages) {
            if (json.query.pages[page].title && json.query.pages[page].ns == 0) {
                $('#orig_id')[0].value = json.query.pages[page].pageid;
                title = json.query.pages[page].title;
                $('#origin')[0].innerText = title;
                for (const link in json.query.pages[page].links) {
                    if (json.query.pages[page].links[link].ns == 0) {
                        $('#nextList').append($('<option>').html(json.query.pages[page].links[link].title).val(json.query.pages[page].links[link].title));
                    }
                }
            }
        }
        if (title == '') {
            getOrigin(random, '', param2);
        } else if (json.continue && json.continue.plcontinue) {
            getOrigin(random, '&pageids=' + $('#orig_id')[0].value + '&plcontinue=' + json.continue.plcontinue, param2);
        } else {
            getDestination(random, param2);
        }
    });
}

function getDestination(random, param) {
    if (param == '') {
        param = '&generator=random&grnnamespace=0';
//        param = "&pageids=" + random.nextInt();
    }
    $.getJSON("https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&redirects=true&origin=*&rvprop=content&rvslots=*"+param, function (json){
        let title = '';
        for (const page in json.query.pages) {
            if (json.query.pages[page].title && json.query.pages[page].ns == 0) {
                $('#dest_id')[0].value = json.query.pages[page].pageid;
                title = json.query.pages[page].title;
                $('#destination')[0].innerText = title;
                let dom = new DOMParser().parseFromString('<div>' + json.query.pages[page].extract + '</div>', "text/xml");
                $('#popup_description')[0].innerText = dom.getElementsByTagName('p')[0].textContent;
            }
        }
        if (title == '') {
            getDestination(random, '');
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
    const seed = ("" + today.getFullYear() + (today.getMonth()+10) + today.getDate()+10) * 1;
    const random = new Random(seed);
    if ($('#seed')[0].value != seed) {
        makeQuestion(random);
        $('#seed')[0].value = seed;
    } else {
        getOrigin(random, '&pageids=' + $('#orig_id')[0].value, '&pageids=' + $('#dest_id')[0].value);
    }
}

class Random {
  constructor(seed) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed;
  }

  next() {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
  }

  nextInt() {
    const r = Math.abs(this.next());
    return 1 + (r % 4500000);
  }
}

function goal() {
    alert('GOAL!');
}

function shot() {
    const selectItem = $('#nextList').val();
    $('#nextList > option').remove();
    if (selectItem == $('#destination')[0].value) {
        goal();
    } else {
        $('#prevList').append($('<li>').html(selectItem));
        getLinksByTitle(selectItem, '');
    }
}

function popupDescription() {
  if(!$("#popup")) return;
  closePopUp($("#popup")[0]);
  closePopUp($("#question")[0]);
  function closePopUp(elem) {
    if(!elem) return;
    elem.addEventListener('click', function() {
      $("#popup")[0].classList.toggle('is-show');
    });
  }
}

