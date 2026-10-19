# Roteiro 1 — Tiago Marson Polo
### Slides 2 a 5 · Abertura e Diagrama de Sequência
**Tempo estimado:** 3 a 4 minutos

---

## Slide 2 — O que vamos apresentar

**Fala:**

> Boa noite. Nós vamos apresentar dois diagramas da UML aplicados ao nosso sistema, o Prime Motors, que é uma plataforma de compra de veículos para concessionária.
>
> O roteiro é este: primeiro explico por que existem dois diagramas para a mesma coisa, depois o diagrama de sequência, em seguida o de comunicação, o fluxo de compra passo a passo, a ligação com os requisitos que levantamos e, por fim, quando usar cada um.

**Não precisa ler os seis itens em voz alta** — aponte para a tela e resuma em uma frase.

---

## Slide 3 — Dois diagramas, o mesmo comportamento

Este é o slide mais importante do seu bloco. É a pergunta que o professor provavelmente vai fazer.

**Fala:**

> A UML chama os dois de **diagramas de interação**. Os dois mostram a mesma coisa: objetos trocando mensagens. O que muda é o eixo de organização.
>
> O **diagrama de sequência organiza pelo tempo**: cada participante tem uma linha vertical, e as mensagens descem de cima para baixo. Bateu o olho, você sabe a ordem.
>
> O **diagrama de comunicação organiza pelo espaço**: os objetos ficam espalhados, ligados por linhas, e a ordem aparece na numeração das mensagens — 1, depois 1.1, depois 1.1.1.

**Frase de fechamento (importante):**

> Não são diagramas concorrentes. É possível converter um no outro sem perder nenhuma informação — são duas fotos do mesmo processo, tiradas de ângulos diferentes.

---

## Slide 4 — Diagrama de Sequência: os elementos

**Fala:**

> O diagrama de sequência representa a comunicação entre os usuários e o sistema ao longo do tempo. Ele tem quatro elementos:
>
> **Participantes** — as caixas no topo e no rodapé. No nosso caso, os três atores e as funcionalidades do sistema.
>
> **Linha de vida** — a linha tracejada vertical embaixo de cada caixa. Ela representa que aquele participante existe durante todo o processo.
>
> **Mensagens** — as setas horizontais. Cada seta liga quem pede a quem executa.
>
> **Ordem** — de cima para baixo. A primeira seta é a primeira coisa que acontece.

**Aponte para o quadro escuro à direita:**

> No Prime Motors isso deu três atores e doze funcionalidades.

---

## Slide 5 — O diagrama de sequência

Deixe o slide na tela alguns segundos antes de falar.

**Fala:**

> Aqui está o diagrama. À esquerda os três atores; à direita, as doze funcionalidades do sistema.
>
> As setas contínuas são **associação**: o ator utiliza aquela funcionalidade. Por exemplo, o Visitante se associa a "Consultar Estoque".
>
> As setas tracejadas são **herança**. Repare que existem duas: uma do Cliente para o Visitante, e outra do Administrador para o Cliente.

**Transição para o próximo apresentador:**

> E é justamente sobre essa herança que o [nome] vai falar agora.

---

## Se o professor perguntar

**"Por que fizeram os dois diagramas?"**
> Porque cada um responde uma pergunta diferente. O de sequência responde "em que ordem acontece"; o de comunicação responde "quem depende de quem". Para o trabalho, os dois juntos documentam melhor o sistema.

**"Qual a diferença entre linha de vida e ativação?"**
> A linha de vida é a linha tracejada, que mostra que o objeto existe. A barra de ativação é o retângulo sobre a linha, que mostra que ele está executando alguma coisa naquele momento.

**"O que significa uma seta que volta?"**
> É a resposta ao chamador. No nosso diagrama, no fim, as setas voltam para o Cliente e para o Administrador.
