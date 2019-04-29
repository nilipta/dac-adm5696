/******************************************************
*Name : I2c compatible function
*Date : 1-2-2019
*version : v 1.0
*Author :Nilipta satapatyy
*******************************************************/


var i2c = require('i2c-bus');
var sleep = require('sleep');
var i2cBus = exports;

/*********************************************** */
/*************   GLOBAL VARIABLES    *********** */
/*********************************************** */


/*********************************************** */
/*************   I2c Functions    ************** */
/*********************************************** */

var i2cDev = i2c.open(1, (err) => {
    if (err) {
        throw err;
    }
    else {
	console.log('I2c connected');
    }

});


//Write direcly to device
i2cBus.write = function (slaveAddr, length, buffer) {
    console.log("( write ) register --> " + slaveAddr + "  data --------->" + buffer.toString('hex'));
    return new Promise((resolve, reject) => {
        i2cDev.i2cWrite(slaveAddr, length, buffer, (err, bytesWritten, buffer) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}


//Read direcly to device
i2cBus.read = function (slaveAddr, length, buffer) {
    console.log("( write ) register --> " + slaveAddr + "  data --------->" + buffer);
    return new Promise((resolve, reject) => {
        i2cDev.i2cRead(slaveAddr, length, buffer, (err, bytesRead, buffer) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}


//write only a byte
i2cBus.WriteByte = function (slaveAddr, reg_address, WriteData) {
    console.log("( WriteByte ) register --> " + reg_address + "  data --------->" + WriteData);
    return new Promise((resolve, reject) => {
        i2cDev.writeByte(slaveAddr, reg_address, WriteData, (err, i2cResponse) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

//write only a word
i2cBus.writeWord = function(slaveAddr, reg_address, WriteData) {
    //console.log("( writeWord ) register --> " + reg_address + "  data --------->" + WriteData);
    return new Promise((resolve, reject) => {
        i2cDev.writeWord(slaveAddr, reg_address, WriteData, (err, i2cResponse) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

//Read only one pair of High + Low bytes
i2cBus.ReadWord = function (slaveAddr, reg_address) {
    //console.log('reg_address >>>>>>>>>>>>>>>> ' + reg_address)
    return new Promise((resolve, reject) => {
        i2cDev.readWord(slaveAddr, reg_address, (err, i2cResponse) => {
            if (err) throw err;
            //console.log('i2cResponse ====================' + i2cResponse);
            resolve(i2cResponse);
        });
    });

}

//Read only one byte or one address
i2cBus.ReadByte = function (slaveAddr, byte_addr) {
    return new Promise((resolve, reject) => {
        i2cDev.readByte(slaveAddr, byte_addr, (err, i2cResponse) => {
            if (err) {
                //console.log('error :: ' + err);
                reject(new Error('error ' + err));
            }
            else {
                resolve(i2cResponse);
            }
        })
    });
}


// Read multiple registers through I2c
i2cBus.ReadRegs = function (slaveAddr, reg_address, Bytes) {
    //console.log("( ReadRegs ) reg_address ----> " + reg_address + "  Bytes --------->" + Bytes);
    return new Promise((resolve, reject) => {
        var buf1 = Buffer.alloc(Bytes);
        i2cDev.readI2cBlock(slaveAddr, reg_address, Bytes, buf1, (err, i2cResponse) => {
            if (err) {
                console.log(err);
            }

            else {
                //console.log("readig from " + Bytes + " bytes = " + buf1)
                //console.log(buf1)
                resolve(buf1)
            }
        });
    });
}

/* writes a register to the AK8963 given a register address and data */
i2cBus.writeAK8963Register = async function (subAddress, data) {
    return new Promise(async (resolve, reject) => {
        try {
            // set slave 0 to the AK8963 and set for write
            let response = await this.WriteByte(collection.I2C_SLV0_ADDR, collection.AK8963_I2C_ADDR)
            if (!response) {
                resolve(false);
            }
            console.log('1--1------------writeAK8963Register------------ ' + response);
            // set the register to the desired AK8963 sub address 
            response = await this.WriteByte(collection.I2C_SLV0_REG, subAddress)
            if (!response) {
                resolve(false);
            }
            console.log('1--2------------writeAK8963Register------------ ' + response);
            // store the data for write
            response = await this.WriteByte(collection.I2C_SLV0_DO, data)
            if (!response) {
                resolve(false);
            }
            console.log('1--3------------writeAK8963Register------------ ' + response);
            // enable I2C and send 1 byte
            response = await this.WriteByte(collection.I2C_SLV0_CTRL, collection.I2C_SLV0_EN | 1)
            if (!response) {
                resolve(false);
            }
            console.log('1--4------------writeAK8963Register------------ ' + response);
            // read the register and confirm
            let res = await this.readAK8963Registers(subAddress, 1) < 0;        //readAK8963Registers
            if (res == data) {
                console.log('1--5------------writeAK8963Register------------ true');
                resolve(true);
            } else {
                console.log('1--6----XX--------writeAK8963Register------XX------ FALSE ' + res + " =!= " + data);
                resolve(false);
            }
        }
        catch (err) {
            console.log(err);
        }
    })
}


/* reads registers from the AK8963 */
i2cBus.readAK8963Registers = function (subAddress, count) {
    let response;
    let _status
    return new Promise(async (resolve, reject) => {
        try {
            // set slave 0 to the AK8963 and set for read
            response = await this.WriteByte(collection.I2C_SLV0_ADDR, collection.AK8963_I2C_ADDR | collection.I2C_READ_FLAG)
            if (!response) {
                resolve(false);
            }
            console.log('2--1------------writeAK8963Register------------ ' + response);
            // set the register to the desired AK8963 sub address
            response = await this.WriteByte(collection.I2C_SLV0_REG, subAddress)
            if (!response) {
                resolve(false);
            }
            console.log('2--2------------writeAK8963Register------------ ' + response);
            // enable I2C and request the bytes
            response = await this.WriteByte(collection.I2C_SLV0_CTRL, collection.I2C_SLV0_EN | count)
            if (!response) {
                resolve(false);
            }
            console.log('2--3------------writeAK8963Register------------ ' + response);
            sleep.msleep(10); // takes some time for these registers to fill
            // read the bytes off the MPU9250 EXT_SENS_DATA registers
            _status = await this.ReadRegs(collection.EXT_SENS_DATA_00, count);
            console.log('2--4------------_status in readAK8963Registers------------ ');
            if (count == 1) {
                if (_status[0].toString(16) == 0x00) {
                    resolve(0x00);
                }
                else {
                    console.log('XoXoXo------not zero and got value in else')
                    resolve(_status);
                }
            }
            else {
                resolve(_status);
            }
        }
        catch (err) {
            console.log(err);
        }
    })
}


/* gets the MPU9250 WHO_AM_I register value, expected to be 0x71 */
i2cBus.whoAmI = async function () {
    // read the WHO AM I register
    let resp = await this.ReadByte(collection.WHO_AM_I);
    console.log('♣♣♣♣♣♣♣♣ Who am i ♣♣♣♣♣♣♣ ' + resp);
    return resp;
}

/* gets the AK8963 WHO_AM_I register value, expected to be 0x48 */
i2cBus.whoAmIAK8963 = async function () {
    // read the WHO AM I register
    let resp = await this.readAK8963Registers(collection.AK8963_WHO_AM_I, 1)
    console.log('♣♣♣♣♣♣♣♣ whoAmIAK8963 ♣♣♣♣♣♣♣ ' + resp);
    // return the register value
    console.log('♣♣♣♣♣♣♣♣ AFTER whoAmIAK8963 ♣♣♣♣♣♣♣ ');
    return resp;
}



/*********************************************** */
/*********************************************** */
