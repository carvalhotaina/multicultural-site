Portal Multicultural — frontend estático
=======================================

O projeto é um protótipo de frontend (single-page) que demonstra:
- Feed dinâmico de vídeos curtos organizados por tema.
- Perfis de criadores com uma mini-árvore de decisões (simulações "e se...").
- Eventos e formulário de voluntariado.
- Navegação não linear (jump entre perspectivas).
- Rastreamento de micro-interações via localStorage e relatório pessoal.

Como usar
---------
1. Descompacte o arquivo ZIP.
2. Abra `index.html` em um navegador moderno.
3. Para testar vídeos, o protótipo referencia vídeos de exemplo públicos (se seu navegador permitir playback remoto).
4. Interaja: assistir, compartilhar (simulado), inscrever-se — tudo é armazenado no localStorage e aparece no relatório.

Arquivos
-------
- index.html — página principal
- css/styles.css — estilos extras
- js/app.js — lógica da aplicação
- data/content.json — conteúdos de exemplo
- README.md — este arquivo

Observações de desenvolvimento
----------------------------
Este protótipo foi criado como base para um projeto maior. Possíveis melhorias:
- Migrar para React/Vue para componentes e roteamento.
- Backend para persistência (usuários, inscrições, envio de vídeos).
- Sistema de curadoria e moderação de conteúdo.
- Acessibilidade avançada (legendas automáticas, navegação por teclado).
