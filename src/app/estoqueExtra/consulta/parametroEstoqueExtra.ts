import { Filial } from 'src/app/commons/services/classes/Filial';
import { Produto } from 'src/app/commons/services/classes/Produto';
import { Motivo } from 'src/app/commons/services/classes/Motivo';
import { Tipo } from 'src/app/commons/services/classes/Tipo';

export interface ParametroEstoqueExtra{
 filial: Filial[];
 produto: Produto[];
 motivo: Motivo;
 tipo: Tipo;
 dtFimVigencia: string;
 dtInicioVigencia: string;
 dsEstoqueIdeal: string;
 cdOperador: string;
}