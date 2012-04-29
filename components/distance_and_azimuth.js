//
// このプログラムはロジカルアーツ研究所（http://www.logical-arts.jp/）が作成しました。
// プログラムはご自由にお使いいただいて結構ですが、結果の保証はいたしません。
// 計算上の特性をよくご理解いただいてお使いください。
//
// この計算では緯度・経度ともに1度以上にわたる広い範囲には適用できません。
// 緯度・経度が数分以内のごく狭い範囲に限って適用可能です。
// 距離はメートル単位で返され、方位角は真東を0として±180度の範囲で返されます。
//

var A = 6378137;			// 地球の赤道半径
var RAD = Math.PI / 180;	// 1°あたりのラジアン

// 2点間の距離を求める関数
function distance(lat1, lon1, lat2, lon2) {
	// 度をラジアンに変換
	lat1 *= RAD;
	lon1 *= RAD;
	lat2 *= RAD;
	lon2 *= RAD;

	var lat_c = (lat1 + lat2) / 2;					// 緯度の中心値
	var dx = A * (lon2 - lon1) * Math.cos(lat_c);
	var dy = A * (lat2 - lat1);

	return Math.sqrt(dx * dx + dy * dy);
}

// 2点間の方位角を求める関数
function azimuth(lat1, lon1, lat2, lon2) {
	// 度をラジアンに変換
	lat1 *= RAD;
	lon1 *= RAD;
	lat2 *= RAD;
	lon2 *= RAD;

	var lat_c = (lat1 + lat2) / 2;					// 緯度の中心値
	var dx = A * (lon2 - lon1) * Math.cos(lat_c);
	var dy = A * (lat2 - lat1);

	if (dx == 0 && dy == 0) {
		return 0;	// dx, dyともに0のときは強制的に0とする。
	}
	else {
		return Math.atan2(dy, dx) / RAD;	// 結果は度単位で返す
	}
}

function calculate() {
	var lat1 = parseFloat(document.getElementById("lat1").value);
	var lon1 = parseFloat(document.getElementById("lon1").value);
	var lat2 = parseFloat(document.getElementById("lat2").value);
	var lon2 = parseFloat(document.getElementById("lon2").value);
	
	document.getElementById("distance").value = distance(lat1, lon1, lat2, lon2).toFixed(1);
	document.getElementById("azimuth").value = azimuth(lat1, lon1, lat2, lon2).toFixed(2);
}

// Added for node.js application
exports.distance = distance;
