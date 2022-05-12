# Field Service Styles

Esse documento tem como objetivo guiar e orientar aspectos do Front-end na aplicação Field Service.

Caso haja alguma duvida, entrar em contato com [Felipe Paulino](mailto:fapaulino.fcamara@rd.com.br)

## Arquivos 

Dentro do projeto, mas especificamente na pasta SASS, há uma estrutura de pastas. Ela fica localizada em: `src/sass`

Dentro da pasta SASS há 7 tipos de pastas e um arquivo principal: 

- Abstracts (Mixins, Variables)
- Base (Typography)
- Components (Alerts, Buttons, Fields)
- Layout (Page)
- Pages (não está sendo utilizada)
- Themes (não está sendo utilizada)
- Vendors (não está sendo utilizada)

-`Styles.scss`

Caso seja necessário incluir um novo arquivo `.scss` nessas pastas não se esqueça de importar o arquivo dentro do `style.scss`

`@import 'pastadoarquivo/nomedoarquivo'`

Obs: Dentro do projeto já está instalado o Bootstrap 4.1, para acessar os arquivos navege até `node_modules/bootstrap`

## Abstracts

### Mixins

Dentro do Mixins foi adicionado os seguintes elementos: 
- Flexbox 
- Font Face

Atencão: Antes de incluir qualquer Mixin novo, de uma olhada nos arquivos do Bootstrap, assim você pode reaproveitar algo de lá. 

### Variables

Dentro de `Variables.scss` você encontrar todas as variaves utilizadas no portal. 

- Internal Vatiables
- Colors
- Font Family
- Font Size

TOME CUIDADO PARA NÃO ALTERAR OS NOMES DAS "GLOBAL VARIABLES"! 

## Base
### Typography

## Components 
### Alerts
### Buttons
### Fields

## Layout
### Page

## Icons 

### Os icones utilizados foram os Line Awesome. 

Para inserir um icone dentro de algum elemento use `<i></i>`

```html
<label> <i class="fa fa-home"></i> Usuário RD</label>
```

Lista de icones disponiveis [aqui](https://icons8.com/line-awesome).

Para inserir um tamanho só acrescentar a classe `fa-1x` como mencionado acima na tag `<i>`

```html
<label> <i class="fa fa-1-5x fa-home"></i> Usuário RD</label>
```


```css

.fa-0-5x{
    font-size: 1.125rem; /* 18px */
}

.fa-1x{
    font-size: 1rem; /* 24px */
}

.fa-1-4x{
  font-size: 1.65rem; /* 26.4px */
}

.fa-1-5x{
    font-size: 1.75rem; /* 28px */
}

```

Os tamanho acima são os padrões definidos para uso no sistema. 

Para inserir um tamanho só acrescentar a classe `fa-1x` como mencionado acima na tag `<i>`

```html
<label> <i class="fa fa-1-5x fa-home"></i> Usuário RD</label>
```

#### Atenção
- Os demais tamanhos não é necessário mexer. 
- As cores dos icones não alteradas de acordo com o elemento "Pai" que a mesma é inserida.
