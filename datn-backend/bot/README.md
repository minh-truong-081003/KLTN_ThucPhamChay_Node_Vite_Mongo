**Bot module — Hướng dẫn ngắn**

- Vị trí: `bot/` chứa các file liên quan chatbot: `index.js`, `more.js`, `langchain.js`, `dedupe.js`, `train-runner.js`.

- Thêm dữ liệu huấn luyện:
  - Tĩnh: chỉnh `bot/langchain.js` (đã refactor thành `registerStaticIntents(manager)`)
  - Động: thêm vào collection `pre_training` trong MongoDB (fields: `class`, `question`, `answer`).

- Huấn luyện lại (an toàn):
  - Gọi API: `GET http://localhost:3333/api/train` — server sẽ xây dựng một trainer mới, load static + dynamic intents, ingest `pre_training`, train, và import model vào runtime.
  - Hoặc chạy thủ công: trong thư mục `bot/`: `node train-runner.js` — tạo file `model.txt`.

- Upload file Excel: `POST /upload` (multipart-form, field `file`) — server sẽ dùng luồng trainer tạm thời, thêm nội dung upload (đã có dedupe), train và import kết quả.

- Rollback/backup: `model.txt` được lưu mỗi lần train; cân nhắc copy `model.txt` sang storage để lưu lịch sử.

- Dedupe: bot sử dụng `bot/dedupe.js` (Jaccard + Levenshtein) để tránh thêm các câu gần giống vào model.

Nếu muốn mình cài đặt thêm (fuzzy-threshold config, cron retrain, hoặc UI quản trị), nói mình biết.
