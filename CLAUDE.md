# Projeto: Gerador de Moldura — Campanha Renato Rocha

## Identidade visual (não alterar)

### Cores
- Azul institucional: #1B2C7A (fundo da página)
- Azul claro (CTA de download): #1E88E5
- Amarelo: #FBB914
- Verde: #00A650
- Bege (card do canvas): #FDF8F0
- Branco: #FFFFFF
- Barra tricolor (base do logo): #FBB914 / #00A650 / #1E88E5

### Tipografia
- Títulos e botões: Grift (Bold para headline/botões, Medium para corpo e labels)
- Corpo de texto: Grift
- Gallegos: fonte manuscrita. Uso restrito a (1) assinatura "Arrocha!" no
  logo e (2) palavra "Apoie" no headline da home. Nunca em outro elemento
  de interface.

### Logo
- Usar apenas os arquivos em /assets. Nunca recriar em CSS ou SVG.
- Nunca distorcer, rotacionar ou alterar cores.
- Área de respiro mínima: altura do "R" em todos os lados.

## Regras de UI
- Mobile-first. Referência: iPhone 13 (390x844). Desktop ≥1024px segue
  layout de 3 zonas (texto / foto do candidato / card do canvas).
- Sem scroll no estado inicial (antes do upload) em mobile. Controles
  pós-upload podem gerar scroll.
- Botão de download: fundo azul claro #1E88E5, texto branco, cantos
  suaves.
- Botão secundário (Centralizar, Trocar foto): outline branco sobre
  fundo azul.
- Contraste mínimo WCAG AA. Amarelo #FBB914 nunca com texto branco.

## Regras técnicas
- Processamento 100% client-side. Nenhum upload de foto para servidor.
- Export final: PNG 1080x1080.
