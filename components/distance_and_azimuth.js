//
// ���̃v���O�����̓��W�J���A�[�c�������ihttp://www.logical-arts.jp/�j���쐬���܂����B
// �v���O�����͂����R�ɂ��g�����������Č��\�ł����A���ʂ̕ۏ؂͂������܂���B
// �v�Z��̓������悭���������������Ă��g�����������B
//
// ���̌v�Z�ł͈ܓx�E�o�x�Ƃ���1�x�ȏ�ɂ킽��L���͈͂ɂ͓K�p�ł��܂���B
// �ܓx�E�o�x�������ȓ��̂��������͈͂Ɍ����ēK�p�\�ł��B
// �����̓��[�g���P�ʂŕԂ���A���ʊp�͐^����0�Ƃ��ā}180�x�͈̔͂ŕԂ���܂��B
//

var A = 6378137;			// �n���̐ԓ����a
var RAD = Math.PI / 180;	// 1��������̃��W�A��

// 2�_�Ԃ̋��������߂�֐�
function distance(lat1, lon1, lat2, lon2) {
	// �x�����W�A���ɕϊ�
	lat1 *= RAD;
	lon1 *= RAD;
	lat2 *= RAD;
	lon2 *= RAD;

	var lat_c = (lat1 + lat2) / 2;					// �ܓx�̒��S�l
	var dx = A * (lon2 - lon1) * Math.cos(lat_c);
	var dy = A * (lat2 - lat1);

	return Math.sqrt(dx * dx + dy * dy);
}

// 2�_�Ԃ̕��ʊp�����߂�֐�
function azimuth(lat1, lon1, lat2, lon2) {
	// �x�����W�A���ɕϊ�
	lat1 *= RAD;
	lon1 *= RAD;
	lat2 *= RAD;
	lon2 *= RAD;

	var lat_c = (lat1 + lat2) / 2;					// �ܓx�̒��S�l
	var dx = A * (lon2 - lon1) * Math.cos(lat_c);
	var dy = A * (lat2 - lat1);

	if (dx == 0 && dy == 0) {
		return 0;	// dx, dy�Ƃ���0�̂Ƃ��͋����I��0�Ƃ���B
	}
	else {
		return Math.atan2(dy, dx) / RAD;	// ���ʂ͓x�P�ʂŕԂ�
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
