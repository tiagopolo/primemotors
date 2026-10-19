# Roteiro 4 — Joaby Dantas dos Santos
### Slides 12 a 14 · Requisitos, comparação e conclusão
**Tempo estimado:** 3 a 4 minutos

---

## Slide 12 — Do requisito ao diagrama

Este é o slide de maior peso da apresentação. Ele mostra que o diagrama nasceu do levantamento de requisitos, e não o contrário.

**Fala:**

> Esta tabela liga cada mensagem do diagrama ao requisito que ela atende e à regra de negócio que ela garante.
>
> Por exemplo: a mensagem **1**, `consultarEstoque`, atende o **RF03** — "o sistema deve listar todos os veículos disponíveis para visualização".
>
> A **3.2**, `calcularFrete`, atende o **RF08** e existe por causa da regra **RN12**, que diz que o cálculo do frete depende do endereço informado.
>
> E a **6.3**, que altera o status para "Vendido", atende o **RF18** e garante a regra **RN03**: um veículo vendido não pode continuar disponível para nova compra.

**Não leia as oito linhas.** Escolha três e siga.

**Frase de fechamento do slide:**

> A ideia é mostrar que nenhuma mensagem foi inventada na hora de desenhar. Cada seta do diagrama nasceu de um requisito que levantamos no início do projeto — o diagrama é a modelagem daquele documento, não um desenho feito à parte.

---

## Slide 13 — Quando usar cada um

**Fala:**

> Fechando a comparação entre os dois.
>
> O **foco**: sequência mostra a ordem no tempo; comunicação mostra quem fala com quem.
>
> A **leitura**: um você lê de cima para baixo; o outro, seguindo a numeração.
>
> Cada um **mostra bem** uma coisa: o de sequência mostra o cenário completo de um caso de uso; o de comunicação revela o acoplamento entre os objetos — quantas setas chegam em um objeto indica o quanto ele concentra responsabilidade.

**Seja honesto sobre as limitações — isso costuma impressionar:**

> E os dois têm limite. O de sequência fica ruim quando há muitos participantes: o nosso, com quinze colunas, já ficou bem largo. O de comunicação fica ruim quando há muitas mensagens, porque vira uma teia de setas — tivemos que reorganizar o nosso em formato de estrela justamente por isso.

**Feche:**

> Por isso usamos cada um onde ele rende melhor: o de sequência para apresentar os atores e as funcionalidades, e o de comunicação para detalhar o fluxo de compra do veículo.

---

## Slide 14 — Conclusão

**Fala:**

> Para encerrar, três pontos.
>
> **Primeiro:** são duas vistas da mesma interação. Sequência mostra a ordem, comunicação mostra a estrutura.
>
> **Segundo:** os dois estão ligados aos requisitos. Cada mensagem aponta para um requisito funcional ou uma regra de negócio do documento que levantamos no início do projeto.
>
> **Terceiro:** eles refletem a modelagem. Os objetos do diagrama são as entidades que definimos no levantamento — usuário, veículo, compra, pagamento, entrega, agendamento e comprovante — e são elas que vão virar as tabelas do banco de dados na próxima etapa.
>
> Era isso. Obrigado, e estamos à disposição para as perguntas.

---

## Se o professor perguntar

**"Qual é o próximo passo do trabalho?"**
> Transformar essas entidades no modelo do banco: o DER e o modelo relacional. Como os objetos do diagrama já são os módulos do documento de requisitos, a passagem para as tabelas fica direta.

**"Vocês vão implementar isso?"**
> Sim, a implementação é a etapa seguinte. Nesta entrega o foco foi a modelagem da interação, que é o que orienta como o sistema vai ser construído.

**"Qual foi a maior dificuldade?"**
> Organizar o diagrama de comunicação. A primeira versão tinha muitas setas se cruzando e ficou ilegível. Reorganizamos colocando a compra no centro e cada objeto num raio próprio, de forma que nenhuma seta cruzasse outra.

**"Por que escolheram o fluxo de compra e não outro caso de uso?"**
> Porque é o fluxo principal do negócio: ele passa por quase todos os módulos do sistema — usuário, veículo, compra, pagamento, entrega, agendamento e comprovante. Modelando ele, cobrimos a maior parte dos requisitos funcionais de uma vez.

---

## Lembrete para o grupo

Nesta apresentação o foco é só a modelagem — não vamos abrir o sistema. Se o professor perguntar sobre a implementação, responda que é a etapa seguinte e volte para o diagrama.
