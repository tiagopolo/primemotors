# Roteiro 3 — Vinicius Braga dos Reis
### Slides 9 a 11 · Objetos, numeração e o fluxo completo
**Tempo estimado:** 4 minutos

---

## Slide 9 — Os objetos que participam da compra

Não leia os nove em voz alta. Agrupe.

**Fala:**

> São nove objetos, e eles se dividem em três grupos.
>
> **Quem age:** o `cliente:Usuario`, que compra, e o `admin:Administrador`, que gerencia a loja.
>
> **O que é vendido:** o `veiculo:Veiculo`, que é o estoque.
>
> **O que registra a venda:** a `compra:Compra` no centro, e ao redor dela o `status`, a `entrega`, o `agendamento`, o `pagamento` e o `comprovante`.

**Frase de ligação com o resto do trabalho:**

> E esses objetos não foram escolhidos agora. Eles são exatamente os módulos centrais que definimos no item 8 do nosso documento de requisitos: usuário, veículo, compra, pagamento, entrega, retirada, agendamento e comprovante. O diagrama é a continuação natural daquele levantamento.

---

## Slide 10 — Como funciona a numeração

Este é o slide que explica **como o diagrama de comunicação guarda a ordem sem ter linha do tempo**. Vale ir devagar.

**Fala:**

> Como o diagrama de comunicação não tem eixo do tempo, a ordem fica na numeração. Vou usar o pagamento como exemplo.
>
> A mensagem **5** é `efetuarPagamento`. É uma chamada principal: o cliente aciona o sistema.
>
> A **5.1** é `registrarPagamento`. O ponto indica que ela acontece *dentro* da 5 — foi a compra que chamou o objeto pagamento.
>
> A **5.2**, `confirmarPagamento`, ainda está dentro da 5: é o pagamento respondendo para a compra.
>
> E a **5.3** altera o status para "Paga" — continua dentro da mesma operação 5.

**Leia a caixa "Regra" à direita:**

> A regra geral é: cada ponto na numeração é um nível de aninhamento. A mensagem 6.1.1 é uma resposta gerada dentro da 6.1, que aconteceu dentro da 6.
>
> E o mais importante: se você ler os números em ordem crescente, reconstrói exatamente a linha do tempo do diagrama de sequência. É por isso que dá para converter um no outro.

---

## Slide 11 — O fluxo completo da compra

Vá rápido nos nove — é uma revisão, não uma explicação nova.

**Fala:**

> Juntando tudo, o fluxo completo é este:
>
> **1** o cliente consulta o estoque. **2** escolhe o carro e inicia a compra, que nasce com status "Iniciada". **3** define se quer retirar na loja ou receber em casa — e se for entrega, o sistema calcula o frete pelo CEP. **4** escolhe data e horário. **5** paga por PIX, boleto ou cartão, e o status vira "Paga". **6** confirma: o status vira "Concluída", o comprovante é gerado e o veículo passa para "Vendido". **7** o comprovante volta para o cliente.
>
> E em vermelho, fora do fluxo do cliente, estão as ações do administrador: **8** manter o estoque e **9** acompanhar os pedidos.

**Destaque o passo 6 — é onde estão as regras de negócio:**

> Repare que o passo 6 faz três coisas de uma vez. Isso não é detalhe: é a regra RN03, que diz que um veículo vendido não pode continuar disponível para nova compra. Por isso confirmar a compra e dar baixa no estoque precisam acontecer na mesma operação — senão dois clientes poderiam comprar o mesmo carro.

**Transição:**

> E é exatamente essa ligação com os requisitos que o [nome] vai mostrar agora.

---

## Se o professor perguntar

**"O que acontece se o pagamento não for confirmado?"**
> A compra fica com status "aguardando pagamento". O comprovante só é gerado após a confirmação — é a regra RN08. E o veículo continua disponível até isso acontecer.

**"Por que o frete é calculado só na entrega?"**
> Porque é a regra RN12: o cálculo depende do endereço informado. Na retirada na loja não existe endereço de entrega, então o frete é zero e o total é só o valor do veículo — o que atende a RN09, que diz que o total é composto pelo veículo e, quando aplicável, pelo frete.

**"Essa numeração 5.1, 5.2 é obrigatória na UML?"**
> A numeração é obrigatória no diagrama de comunicação, porque é ela que define a ordem. O aninhamento com pontos é a notação decimal de Dewey, que a UML recomenda para mostrar chamadas dentro de chamadas.
