
const i2c = require('./i2c_functions');
var sleep = require('sleep');

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

var dacFun = exports;

dacFun.begin = function () {
    console.log('dac function begun');
}

/**************************************************************************/
/*!
    @brief  Any or all DACs (DAC A to DAC D) can be powered down to the
            selected mode by setting the corresponding bits in the input
            shift register.
            In normal power consumption pins supply is 0.59 mA at 5 V
            In power-down mode, the supply current falls to 4 μA at 5 V.
    @param[in]  addr
                                                      A1    A0  (pins)    7 bit addr
                DAC_A               or  0         :   GND   GND           0x08
                DAC_B               or  1         :   GND   V             0x09
                DAC_C               or  2         :   V     GND           0x0A
                DAC_D               or  3         :   V     V             0x0B
    @param[in]  X_State (Where X is Channel)
                0: Normal Operation
                1: 1 kΩ to GND
                2: 100 kΩ to GND
                3: Three-State (NC)
*/
/**************************************************************************/

dacFun.setPowerState = function (addr, A_State, B_State, C_State, D_State) {

      let powerState = (D_State << 6) + (C_State << 4) + (B_State << 2) + (A_State);
    //i2cwrite((D_State << 6) + (C_State << 4) + (B_State << 2) + (A_State));
        console.log('-_-_-_-_-_-_-_-_---setPowerState  ', powerState)
    /*i2c.WriteByte(dacAddress, 0, 0x40)
	.then((writeByteInfo) => {
		sleep.msleep(5);
		console.log('--1-1-1-1-1--11--1-1-1--writeByteInfo1 ::  ' , dacAddress+addr)
		i2c.WriteByte(dacAddress, 0, powerState)
	})
	//.then((writeByteInfo) => {
	//	sleep.msleep(5);
	//	console.log('-2-2-2--2-2-2-2-2--2---writeByteInfo2 ::  ', dacAddress+addr )
	//	i2c.WriteByte(dacAddress, 14, powerState)
	//})
	.catch((err) => {
	   console.log(err);
	})*/

	let completeBufferArray = [0x40, 0x00, powerState];
	let completeBuffer = Buffer.from(completeBufferArray) ;
	console.log('------> in setPowerState -----> ', completeBuffer);

	i2c.write(dacAddress,completeBuffer.length, completeBuffer)
		.then((status) => {
			console.log('i2c write status :: ' , status)
		})
		.catch((err) => {
			console.log(err);
		})
}


/**************************************************************************/
/*!
    @brief  Sets the output voltage to a fraction of source vref.  (Value
            can be 0..65,536)
    @param[in]  addr
                                                      A1    A0  (pins)    7 bit addr
                DAC_A               or  0         :   GND   GND           0x08
                DAC_B               or  1         :   GND   V             0x09
                DAC_C               or  2         :   V     GND           0x0A
                DAC_D               or  3         :   V     V             0x0B
    @param[in]  channel   - use "|" to select multiple channels
                CH_A                or  1         :   Channel A selected
                CH_A | CH_C         or  1|4       :   Channel A,B selected
                CH_A | CH_B | CH_D  or  1|2|8     :   Channel A,B,D selected
                ALL                 or  15        :   All Channels selected
    @param[in]  operation
                NoOperation         or  0         :   No Operation
                WriteInputRegister  or  1         :   Write to Input Register n (dependent on LDAC)
                UpdateDacWithInput  or  2         :   Update DAC Register n with contents of Input Register "channel"
                WriteUpdate         or  3         :   Write to and update DAC Channel "channel"
    @param[in]  value
                The 16-bit value representing the relationship between
                the DAC's input voltage and its output voltage.
*/
/**************************************************************************/
dacFun.setDAC = function (addr, channel, operation, value) {
	return new Promise((resolve, reject) => {
		    // Command And Channel
    let commandbyte = ((operation << 4) + (channel));
	console.log('addr ', addr, '  channel  ', channel, ' operation:: ', operation, '  Value :: ' , value, 'slave id ', dacAddress, 'commandbyte ',  commandbyte)

    var buf = Buffer.alloc(2);

    buf.fill(0) 		// clear all bytes of the buffer
    console.log('buf1  ', buf); // outputs <Buffer 00 00>

    // OR write it with 2 8-bit function calls.
    buf.writeUInt8(value >> 8 & 0xff, 0);        	// MSB
    buf.writeUInt8((value) & 0xFF, 1); 			// LSB
    console.log('buf2  ',buf);                          // outputs <Buffer ff ff>

	let DataMsb = buf[0];
	let DataLsb = buf[1];

	let completeBufferArray = [commandbyte, buf[0], buf[1]];
	let completeBuffer = Buffer.from(completeBufferArray) ;
	console.log(completeBuffer);

	
	i2c.write(dacAddress,completeBuffer.length, completeBuffer)
		.then((status) => {
			console.log('i2c write status :: ' , status)
			resolve(true);
		})
		.catch((err) => {
			console.log(err);
			reject(new Error('error is ' , err))
		})
})

}
