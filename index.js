const dacModule = require('./dac_functions');
const sleep = require('sleep');


const DAC_A = 0b0000;
const DAC_B = 0b0001;
const DAC_C = 0b0010;
const DAC_D = 0b0011;

const CH_NONE = 0b0000;
const CH_A = 0b0001;
const CH_B = 0b0010;
const CH_C = 0b0100;
const CH_D = 0b1000;
const CH_ALL = 0b1111;

const ADDRMSB = 0b01110  //7 BIT ADDRESS FIRST FIVE MSB 00011 << 2;

const NoOperation = 0b0000;
const WriteInputRegister = 0b0001;
const UpdateDacWithInput = 0b0010;
const WriteUpdate = 0b0011;

const stateNormal = 0b0000;
const stateGND1k = 0b0001;
const state100k = 0b0010;
const stateNC = 0b0011;

var dacAddress = 0x0e;
var count = 0;

var setup = function () {
    console.log('init function');
    dacModule.begin()
    dacModule.setPowerState(DAC_A, stateNormal, stateNormal, stateNormal, stateNormal)
}

var loop = function () {
	setup();

	// the below code 1st sets DAC to 20MA and after 5 sec it sets value to 8mA
	dacModule.setDAC(DAC_A, CH_A | CH_C | CH_B | CH_D, WriteUpdate, 60000)
	setTimeout(() => {
		dacModule.setDAC(DAC_A, CH_A | CH_C | CH_B | CH_D, WriteUpdate, 24060);
	}, 5000);
	//DAC A, CH A and C to 0000 ( 0 ma )
	//DAC A, CH A and C to 12060 ( 4 ma )
	//DAC A, CH A and C to 24060 ( 8 ma )
	//DAC A, CH A and C to 36020 ( 12 ma )
	//DAC A, CH A and C to 48000 ( 16 ma )
	//DAC A, CH A and C to 60000 ( 20 ma )

}

loop();
