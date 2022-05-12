export function voltarUrl(arrayVoltar, rotaUrl) {

  if (JSON.parse(localStorage.getItem('urlVoltar')) != undefined){
    arrayVoltar = JSON.parse(localStorage.getItem('urlVoltar'));

    if (arrayVoltar.slice(-1).pop() == rotaUrl) {
      arrayVoltar.pop();
    }

    return arrayVoltar;
  }
}