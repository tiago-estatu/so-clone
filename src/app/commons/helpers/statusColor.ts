export function defineCorStatus(status) {

    // VERDE
    if (
        status == 101
        || status == 31
        || status == 108
        || status == 109
        || status == 112
        || status == 114
        || status == 115
        || status == 116
        || status == 118
        || status == 140
        || status == 137) {
        return "CONCLUIDO";
      }
  
      // VERMELHO
      if (
        status == 104
        || status == 32
        || status == 107
        || status == 111
        || status == 121
        || status == 123
        || status == 125
        || status == 127
        || status == 132
        || status == 135
        || status == 134
        || status == 138
        || status == 141
        || status == 143) {
        return "ERRO";
      }
  
      // AZUL
      if (
        status == 103
        || status == 126
        || status == 136 ) {
        return "DESPACHADO";
      }

      if (
        status == 110 ) {
        return "SEPARACAO";
      }
  
      // AMARELO
      if (
        status == 10 
        || status == 102
        || status == 105
        || status == 106
        || status == 113
        || status == 117
        || status == 119
        || status == 120
        || status == 124
        || status == 128
        || status == 129
        || status == 130
        || status == 131
        || status == 139
        || status == 142
        || status == 144) {
        return "ABERTO";
      } else {
        return "DESPACHADO";
      }
  
  }