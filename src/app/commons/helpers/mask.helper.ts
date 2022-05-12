
// Mascara de datas
export function MaskedDate(event: any) {
  var v = event.target.value;
  if (v.match(/^\d{2}$/) !== null) {
    event.target.value = v + '/';
  } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
    event.target.value = v + '/';
  }
}

// Mascara de datas back
export function MaskedDateBack(event: any) {
  var v = event.target.value;
  if (v.match(/^\d{2}$/) !== null) {
    event.target.value = v + '-';
  } else if (v.match(/^\d{2}-\d{2}$/) !== null) {
    event.target.value = v + '-';
  }
}

export function dateTimeMask(event: any) {
  
  let v = event.target.value.replace(/\D/g, '');

    let separators = {
        "2": '/',
        "4": '/',
        "8": ' ',
        "10": ':',
    };

    event.target.value = v.split('').reduce((prev, curr, idx) => {
        let position = idx+1;
        prev += (!!separators[position.toString()] ? `${curr}${separators[position.toString()]}` : curr);
        return prev
    }, '');

}


// Mascara de cpf ou cnpj
export function cpfCnpjMask(rawValue) {
  var numbers = rawValue.match(/\d/g);

  var numberLength = 0;
  if (numbers) {
    numberLength = numbers.join('').length;
  }
  if (numberLength <= 11) {
    return [/[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/];
  } else {
    return [/[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/];
  }
}


// Mascara de telefone
export function phoneMask(telefone) {

  var numbers = telefone.match(/\d/g);

  var numberLength = 0;
  if (numbers) {
    numberLength = numbers.join('').length;
  }

  if (numberLength <= 10) {
    return ['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
  } else {
    return ['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
  }

}