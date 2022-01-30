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
            if (json.query.pages[page].title && json.query.pages[page].ns == 0 && json.query.pages[page].links.length != 0) {
                $('#orig_id')[0].value = json.query.pages[page].pageid;
                title = json.query.pages[page].title;
                $('#origin')[0].innerText = title;
                $('#now_keyword')[0].innerText = title;
                json.query.pages[page].links.forEach(function (link, index) {
                    if (link.ns == 0) {
                        let item = $('<li>').html(link.title);
                        let ix = $("#nextList").children().length;
                        item.on('click', function() {
                            selectItem(ix);
                        });
                       $('#nextList').append(item);
                    }
                });
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
            $('#now_keyword')[0].innerText = json.query.pages[page].title;
            json.query.pages[page].links.forEach(function (link, index) {
                if (link.ns == 0) {
                    let item = $('<li>').html(link.title);
                    let ix = $("#nextList").children().length;
                    item.on('click', function() {
                        selectItem(ix);
                    });
                   $('#nextList').append(item);
                }
            });
        }
        if (json.continue && json.continue.plcontinue) {
            getLinksByTitle(title, '&plcontinue=' + json.continue.plcontinue);
        }
    });
}

function selectItem(index) {
    if ($("#selected_index")[0].value) $("#nextList").children()[$("#selected_index")[0].value].className = "un_select_item";
    $("#nextList").children()[index].className = "select_item";
    $("#selected_index")[0].value = index;
    $("#selected_item")[0].value = $("#nextList").children()[index].innerText;
}
function today() {
    const today = new Date();
    const seed = ("" + today.getFullYear() + (today.getMonth()+10) + today.getDate()+10) * 1;
    const random = new Random(seed);
    $('#choice')[0].value = 0
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
function gameover() {
    alert('GAME OVER');
}

function shot() {
    if (!$("#selected_item")[0].value || $("#selected_item")[0].value == '') return;
    const selectItem = $('#selected_item')[0].value;
    $("#selected_item")[0].value = "";
    $("#selected_index")[0].value = "";
    $('#nextList > li').remove();
    if (selectItem == $('#destination')[0].value) {
        goal();
    } else if ($('#choice')[0].value <= 4) {
        $('#prevList').children()[$('#choice')[0].value].innerText = selectItem;
        $('#choice')[0].value = $('#choice')[0].value * 1 + 1;
        getLinksByTitle(selectItem, '');
    } else {
        gameover();
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
