### Для аутентификации и интеграции были рассмотрены два способа:

- с использованием токена доступа OAuth  
  доп.материалы:
  [как создать приложение](https://developer.monday.com/apps/docs/manage), [OAUTH](https://developer.monday.com/apps/docs/oauth)  
  Создаем приложение, прописываем url redirect, публикуем приложение. Далее
  переходим [по ссылке](https://auth.monday.com/oauth2/authorize?client_id=0a331d36b08d89ed16766fe74805ae06)
  и соглашаемся на разрешения для action-a.
  После чего пользователь перенаправляется на страницу приложения и мы должны получить код доступа в ссылке,
  действительный в течении 10 мин, который надо обменять на постоянный токен доступа.
  На этом шаге возникает проблема “...has been blocked by CORS policy: Response to preflight request doesn't pass access
  control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.”  

- с использованием глобального токена API пользователя
  [доп. информация](https://developer.monday.com/apps/docs/choosing-auth) Переходим на использование глобального токена пользователя.
[Описание](https://support.monday.com/hc/en-us/articles/360005144659-Does-monday-com-have-an-API-#h_01EZ9M2KTTMA4ZJERGFQDYM4WR), [ссылка на получение токена для пользователя](https://auth.monday.com/admin/integrations/api)

Первый способ предпочтительней, т.к. есть возможность из коробки выбрать аккаунт пользователя, видны разрешения для
приложения и также возможна проверка токена на валидность, второй способ более лаконичный.

### Проект

- Реализована аутентификация по второму типу
- Все запросы к monday в [queries.ts](./src/queries.ts)
- [schema.json](./schema.json) в проекте - схема GraphQL, определяющая структуру данных API и содержащая все возможные запросы и мутации
для использования, справочный материал
- Доски: не найдена возможность получить в запросе количество досок любого или конкретного типа, поэтому
производим запрос досок в цикле по максимальному кол-ву в 100 досок (по умолчанию 25, ограничение 100) и фильтруем по типу “board”.
Далее сортируем доски по последней использованной пользователем (‘order_by:used_at’), что увеличивает эффективность
поиска.  
- Колонки, мутация: В monday (см. ниже) различный уровень поддержки колонок, некоторые не поддерживаются для мутации. Вывод большинства
поддерживаемых типов колонок реализовано через switch в [ProfileProcessing](./src/ProfileProcessing/index.tsx). Для поля “phone” закомментирован запрос с
выводом в колонке monday иконки флага страны, т.к. потребуется подключать плагин по определению кода страны.

### Полезные ссылки monday

- [Песочница](https://monday.com/developers/v2/try-it-yourself)
- [Обзор GraphQL с примерами запросов](https://developer.monday.com/api-reference/docs/introduction-to-graphql)
- [Как создать приложение](https://developer.monday.com/apps/docs/manage)
- [OAUTH](https://developer.monday.com/apps/docs/oauth)
- [Справочник по поддержке типов колонок](https://developer.monday.com/api-reference/docs/guide-to-changing-column-data)
- [(!)Обратить внимание на ограничения](https://developer.monday.com/api-reference/docs/rate-limits)
- [Доски](https://developer.monday.com/api-reference/docs/boards)

