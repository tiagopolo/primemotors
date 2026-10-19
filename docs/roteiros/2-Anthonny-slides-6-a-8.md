# Roteiro 2 — Anthonny Gabriel Ribeiro
### Slides 6 a 8 · Atores e Diagrama de Comunicação
**Tempo estimado:** 3 a 4 minutos

---

## Slide 6 — Os três atores

Você entra emendando na herança que o apresentador anterior citou.

**Fala:**

> Como o [nome] mostrou, o diagrama tem três atores, e eles são ligados por herança.
>
> O **Visitante** é o acesso público: ele pode se autenticar, consultar o estoque e detalhar um veículo. Ou seja, quem entra no site sem conta já consegue olhar os carros.
>
> O **Cliente herda do Visitante** — então tudo que o visitante faz, ele também faz — e ganha o que exige conta: recuperar senha, realizar compra, escolher recebimento, agendar, pagar e emitir o comprovante.
>
> O **Administrador herda do Cliente** e ganha as funções de gestão: gerenciar estoque, gerenciar pedidos e visualizar relatórios.

**Explique por que a herança importa (esta frase vale nota):**

> A herança não é enfeite: ela evita repetir associação. Sem ela, teríamos que desenhar as nove setas do Cliente novamente para o Administrador. Com a herança, uma seta tracejada resolve.

**Ligue com o levantamento de requisitos:**

> Essa separação de perfis atende o requisito não funcional RNF07, que exige controle de acesso entre usuário comum e administrador, e a regra RN10, que diz que só o administrador cadastra ou remove veículos do estoque.

---

## Slide 7 — Diagrama de Comunicação: os elementos

**Fala:**

> Agora o segundo diagrama. Mesma interação, organizada pela topologia — quem troca mensagem com quem.
>
> **Objetos** — são escritos no formato `instância dois pontos Classe` e ficam sublinhados. Então `compra:Compra` é *um* objeto compra, uma instância; não é a classe.
>
> **Ligações** — as linhas entre os objetos. Se existe linha, significa que um objeto conhece o outro e pode chamá-lo.
>
> **Mensagens numeradas** — 1, 2, 3 são as chamadas principais. Um número como 2.1 significa que aquela chamada aconteceu *dentro* da 2.
>
> **Retornos** — as setas tracejadas, que são a resposta voltando para quem chamou.

**Leia o quadro escuro de baixo — é o ponto forte do slide:**

> E por que o `compra:Compra` ficou no centro? Porque ele é quem orquestra o processo: recebe os pedidos do cliente e delega para entrega, agendamento, pagamento e comprovante. Ele corresponde ao módulo Compra que definimos no item 8 do documento de requisitos, quando dividimos o sistema em módulos centrais.

---

## Slide 8 — O diagrama de comunicação

**Fala:**

> Este é o diagrama completo do fluxo de compra.
>
> Repare na organização: o cliente está no canto superior esquerdo, o administrador no direito, o estoque no topo, e a compra no centro. Todas as setas partem ou chegam no centro — isso mostra visualmente que a compra é o objeto que concentra as responsabilidades.
>
> As setas contínuas são chamadas; as tracejadas são retornos. E no canto inferior esquerdo deixamos a caixa "Como ler o diagrama", com o fluxo escrito em português, e a caixa com os requisitos atendidos.

**Transição:**

> O [nome] vai detalhar agora os objetos e a numeração.

---

## Se o professor perguntar

**"Por que `compra:Compra` e não só `Compra`?"**
> Porque o diagrama de comunicação trabalha com objetos, não com classes. `compra` é o nome da instância e `Compra` é a classe dela. Se tivéssemos duas compras simultâneas, seriam dois objetos da mesma classe.

**"Essa herança entre atores aparece no diagrama de comunicação?"**
> Não. A herança é um relacionamento estrutural, então ela aparece no diagrama de casos de uso e no de classes. O diagrama de comunicação mostra troca de mensagens entre objetos, então lá o cliente e o administrador aparecem separados, cada um com as mensagens que envia.

**"Por que o status é um objeto separado?"**
> Para atender a regra RN11, que exige manter o histórico do status da compra — iniciada, aguardando pagamento, paga, agendada e concluída. Separando em um objeto próprio, fica explícito quem altera o status e em que momento.
