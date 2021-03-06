function request(data, options) {
  var url = "http://soniccenter.org/source/utilities/codebot.php";
  var firstKeyFlag = true;
  for (var key in data) {
    if (firstKeyFlag) {
      url += "?" + key + "=" + data[key];
      firstKeyFlag = false;
    } else {
      url += "&" + key + "=" + data[key];
    }
  }
  url = "http://cors.io/?u=" + encodeURIComponent(url); //be sneaky and use a proxy
  options.url = url;
  options.error = TSCError;
  return $.ajax(options);
}

function addOutput(v) {
	$('.output').html($('.output').html() + "<br>" + v);
}

function clearOutput() {
	$('.output').html('')
}

function TSCError() {
	addOutput("Failed to access TSC. Perhaps the website is down?");
}
function parseStat(stat) {
	//do later
}

//which games have which categories
var catIDs = new Array();
catIDs[0] = "";
catIDs[5] = "AHIEbcdfgklmn";
catIDs[124] = "ACHIEbdfgklmn";
catIDs[128] = "AHEbcdfgiklmn";
catIDs[6] = "AHIEGbcdfklmn";
catIDs[127] = "ACHIEbdfgklmn";
catIDs[10] = "AHIEbcdfgklmn";
catIDs[112] = "AHIEbcdfgklmn";
catIDs[7] = "ACHIGbdefklmn";
catIDs[8] = "AHIGbcdefklmn";
catIDs[106] = "AHIEbcdfgklmn";
catIDs[114] = "AHIbcdefgklmn";
catIDs[115] = "AHIEbcdfgklmn";
catIDs[13] = "AHIEbcdfgklmn";
catIDs[9] = "AHIbcdefgklmn";
catIDs[3] = "AHIDFGbceklmn";
catIDs[4] = "AHIDFGbceklmn";
catIDs[11] = "ABHEFcdgiklmn";
catIDs[25] = "AHIFbcdegklmn";
catIDs[28] = "AHIbcdefgklmn";
catIDs[30] = "AIFKbcdeghlmn";
catIDs[92] = "ABKcdefghilmn";
catIDs[86] = "AHFbcdegiklmn";
catIDs[87] = "AHIFbcdegklmn";
catIDs[94] = "AHIbcdefgklmn";
catIDs[107] = "AHIFbcdegklmn";
catIDs[111] = "ACBHIFdegklmn";
catIDs[125] = "AHbcdefgiklmn";
catIDs[14] = "AHIbcdefgklmn";
catIDs[15] = "AHIbcdefgklmn";
catIDs[16] = "AHIbcdefgklmn";
catIDs[17] = "AHIbcdefgklmn";
catIDs[20] = "AHIEbcdfgklmn";
catIDs[1] = "AHIEbcdfgklmn";
catIDs[2] = "AHIEFbcdgklmn";
catIDs[23] = "AHEFbcdgiklmn";
catIDs[24] = "ACHIEFbdgklmn";
catIDs[61] = "ACBHIFdegklmn";
catIDs[108] = "ABHIEFcdgklmn";
catIDs[113] = "AHEFbcdgiklmn";
catIDs[126] = "AHIEFbcdgklmn";
catIDs[18] = "Abcdefghiklmn";
catIDs[19] = "Abcdefghiklmn";
catIDs[12] = "Abcdefghiklmn";
catIDs[26] = "CDabefghiklmn";
catIDs[73] = "CDabefghiklmn";
catIDs[103] = "CDabefghiklmn";
catIDs[109] = "Cabdefghiklmn";
catIDs[118] = "CDabefghiklmn";
catIDs[116] = "Cabdefghiklmn";
catIDs[27] = "AHIFbcdegklmn";
catIDs[62] = "AHIFbcdegklmn";
catIDs[29] = "Abcdefghiklmn";
catIDs[22] = "Iabcdefghklmn";
catIDs[21] = "Abcdefghiklmn";

//update the categories when a game is chosen
function updateCategories() {
	var game = $(this).val();
	for (var i = 0; i <= catIDs[game].length; i++) {
		var charValue = catIDs[game].charCodeAt(i);
		if (charValue >= 65 && charValue <= 90)
		{
			charValue -= 64;
			$("select[name=category] option[value=" + charValue + "]").prop("disabled", false);
			$("select[name=category] option[value=" + charValue + "]").show();
		}
		else if (charValue >= 97 && charValue <= 122)
		{
			charValue -= 96;
			$("select[name=category] option[value=" + charValue + "]").prop("disabled", true);
			$("select[name=category] option[value=" + charValue + "]").hide();
		}
		if (game == 0)
		{
			$("select[name=category]").hide();
		}
		else
		{
			$("select[name=category]").show();
		}
		$("select[name=category]").val("0")
	}
}

//use TSC's IRC handler as an API to get stats
function fetchClass(){
	var game_id = $("select[name=game]").val();
	var cat_id = $("select[name=category]").val();
	var level_name = $("input[name=level_name]").val().replace(" ","%20");
	var div_order = $("input[name=division_order]").val();
	
	var data = {choice: "21"};
	if (game_id !== "0") data['g'] = game_id;
	if (cat_id !== "0") data['c'] = cat_id;
	if (level_name !== "") data['ln'] = level_name;
	data['do'] = div_order;
	
	request(data, {
		beforeSend: function() {$('.loading').show();},
		success: function(response) {
			if (response.match(/Class \d+ is/)) { //returned exactly 1 match
				fetchRankings(response.match(/Class (\d+) is/)[1])
			} else if (response.match(/\d+ class numbers match your search/)) { //returned multiple search results; in this case, just get the first one
				fetchRankings(response.match(/\d+ class numbers match your search: (\d+)/)[1])
			} else { //most likely, no search results were returned
				addOutput(response);
			}
		},
		complete: function() {$('.loading').hide();}
	});
}

function fetchRankings(classid) {
	var username = $("input[name=user]").val().toLowerCase();
	request({choice: '22', 'class': classid}, {success: function(response) {
		var chart_data = response.match(/Class \d+ is (.+)\. (.+) is in (?:a \d+-way tie for )?\x02\x03\d{2}(\d+)\w{2} place\x03\x02 out of (\d+) on this chart with (.+?)(?:, saying ".+")?\.$/);
		addOutput(chart_data[1]);
		//levelname, user, position, numplayers, stat
		addOutput("Record: " + chart_data[5] + " by " + chart_data[2]);
		if (chart_data[2].toLowerCase() !== username) { //the user is NOT in first place
			request({choice: '25', 'class': classid, 'name': username}, {success: function(response) {
				var chart_data_PB = response.match(/Class \d+ is (.+)\. (.+) is in (?:a \d+-way tie for )?\x02\x03\d{2}(\d+)\w{2} place\x03\x02 out of (\d+) on this chart with (.+?)(?:, saying ".+")?\.$/);
				addOutput("My PB: " + chart_data[5])
			}});
		}
	}});
}

$(document).ready(function() {
	$('select[name=game]').change(updateCategories);
	$('input.submit').click(fetchClass);
});
