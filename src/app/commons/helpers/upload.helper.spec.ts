import { UploadHelper } from "./upload.helper";
import { TestHelper } from './test.helper';


const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
describe('Upload Helper', () => {

    // Prep
    const fileConfig = {fileName: 'nome do arquivo', format: 'csv', columns: ['ID','NOME','DESCRICAO']};
    let uploadHelper: UploadHelper;
    let utils: TestHelper = new TestHelper(expect);
    beforeEach(() => {
        uploadHelper = new UploadHelper(fileConfig);
    });
    // TESTS CASES
        it('deve poder instanciar a classe ', () => {
           expect(uploadHelper).toBeDefined();
           expect(uploadHelper.swalBaseOptions).toBeTruthy();
        });

        describe('mensagem erro ao importar', () =>{
            afterEach(() => {
                utils.closeDialog();
            })

          const OPTIONS = {
            title: 'Oops!',
            icon: 'warning',
            content: UploadHelper.DEFAULT_MESSAGE
          }
          
            it('deve exibir uma modal de warning com a mensagem do servidor' , () => {
                const mensagem = 'mensagem CUSTOMIZADA para realizacao dos testes';
                let responseError = {status: 500, error: {mensagem: mensagem}};

                uploadHelper.importError(responseError);
                utils.expectDialog(OPTIONS.title,mensagem,OPTIONS.icon);

                
            });
            it('deve exibir uma modal de warning com a mensagem default' , () => {
                let responseError = {status: 0, error: {}};
                uploadHelper.importError(responseError);
                utils.expectDialog(OPTIONS.title,OPTIONS.content,OPTIONS.icon);

            
            });
        });


    });
