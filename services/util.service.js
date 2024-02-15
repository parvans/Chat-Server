import { to } from 'await-to-js';

export const to = async (promise) => {
  let err, res;

  [err, res] = await to(promise);

  if (err) return [err];

  return [null, res];

};

export const ReE = function (res, err, code) {
  // Error Web Response
  if (typeof err == "object" && typeof err.message != "undefined") {

    err = err.message;

  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json({ success: false, error: err });

};

export const ReS = function (res, data, code) {
  // Success Web Response
  let send_data = { success: true };

  if (typeof data == "object") {

    send_data = Object.assign(data, send_data); //merge the objects

  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);

};

export const TE = function (err_message, log) {
  // TE stands for Throw Error
  if (log === true) {

    console.error(err_message);

  }

  throw new Error(err_message);

};

export const isNull = (field)=> {

  return (
    field === undefined ||
    field === "null" ||
    field === "undefined" ||
    field === "" ||
    field === null
  );

}

export const isObject = (obj)=> {

  return Object.prototype.toString.call(obj) === "[object Object]";

}


export const isEmpty = (obj)=> {

  return !Object.keys(obj).length > 0;

}

export const isEmail = (email) => {

  // const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const reg = /^[a-z0-9]+[.]?[a-z0-9]{0,30}@[a-z]+(\.(in|co|com|net)+)$/;

  if (reg.test(email)) {

    return true;

  } else {

    return false;

  }

};

export const genrateUserName = (name) => {

  if (String(name).length < 0) return "";

  name = name[0].toUpperCase() + name.slice(1).trim();

  min = Math.ceil(0);

  max = Math.floor(900);

  let num = Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  
  let str = `${String(name).slice(0, 4)}${num}`;

  return str;

};

export const firstLetterCap = (data) => {

  let normal = String(data).toLowerCase();

  if (normal.length < 0) {

    return '';

  } else {

    normal = normal[0].toUpperCase() + normal.slice(1).trim();

    return normal;
    
  }
}

export const firstNameSecondNameCap = (data) => {

  let normal = String(data).toLowerCase();
  
  if (normal.length < 0) {

    return '';
      
  } else {

    let arr = normal.split(' ');
    let str = '';
    arr.forEach((item) => {
        str += item[0].toUpperCase() + item.slice(1).trim() + ' ';
    });

    return str;

  }
}

export const firstNameSecondNameCapForReg = (data) => {

  let normal = String(data).toLowerCase();
  
  if (normal.length < 0) {


    return '';
      
  } else {

    // Split the name into an array of words
    var words = data.split(' ');

    // Convert the first letter of the first name to uppercase
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Convert the first letter of the last name to uppercase
    if (words.length > 1) {
        var lastWordIndex = words.length - 1;
        words[lastWordIndex] = words[lastWordIndex].charAt(0).toUpperCase() + words[lastWordIndex].slice(1);
    }

    // Join the words back into a string
    var convertedName = words.join(' ');

    return convertedName;

  }
}

export const findDuplicateValue = (arr) => {

  let dulicate = arr.filter((item, index) => arr.indexOf(item) != index);

  return dulicate;
  
}

