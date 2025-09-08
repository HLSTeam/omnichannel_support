# Project Brief: Hệ thống hỗ trợ vận hành tập trung với AI

**Project Name:** Hệ thống hỗ trợ vận hành tập trung cho **nhiều hệ thống bán buôn mã thẻ, topup/airtime** với kiến trúc multi-tenant  
**Date:** 2024-12-19  
**Version:** 1.0  
**Status:** Draft

---

## Executive Summary

**Product Concept:** Hệ thống hỗ trợ vận hành tập trung tích hợp AI (Ollama) trên nền tảng n8n, tự động hóa việc tiếp nhận, phân phối và xử lý yêu cầu từ admin, khách hàng và nhà cung cấp thông qua các bot Telegram chuyên biệt.

**Primary Problem:** Các **hệ thống bán buôn mã thẻ, topup/airtime** cần một hệ thống hỗ trợ tập trung **multi-tenant** để quản lý hiệu quả các yêu cầu từ nhiều đối tượng khác nhau, **phân biệt rõ ràng giữa các hệ thống**, giảm thời gian xử lý và tăng chất lượng dịch vụ.

**Target Market:** Công ty bán buôn mã thẻ, topup/airtime tại Việt Nam, đặc biệt là những công ty có nhiều đối tác và khách hàng.

**Key Value Proposition:** Tự động hóa 80% quy trình hỗ trợ, giảm 60% thời gian xử lý yêu cầu, tăng 40% độ chính xác trong việc phân phối yêu cầu, và tích hợp tri thức để cải thiện liên tục.

---

## Problem Statement

### Current State & Pain Points
- **Phân tán:** Mỗi đối tượng (admin, khách hàng, NCC) có kênh hỗ trợ riêng biệt, khó quản lý tập trung
- **Thủ công:** Việc phân phối yêu cầu phụ thuộc vào nhân viên, dễ bỏ sót hoặc xử lý sai
- **Thiếu tracking:** Không có hệ thống theo dõi và báo cáo hiệu quả
- **Tri thức phân tán:** Kiến thức và giải pháp không được tập trung và chia sẻ hiệu quả
- **Phản hồi chậm:** Thời gian xử lý yêu cầu kéo dài do quy trình thủ công

### Impact of the Problem
- **Thời gian xử lý:** Trung bình 2-4 giờ cho mỗi yêu cầu phức tạp
- **Chi phí vận hành:** 3-5 nhân viên support cho mỗi 1000 yêu cầu/tháng
- **Độ hài lòng khách hàng:** Chỉ đạt 70-80% do thời gian chờ và xử lý sai
- **Hiệu suất nhân viên:** 40% thời gian dành cho việc phân phối và điều phối

### Why Existing Solutions Fall Short
- **Helpdesk truyền thống:** Không tích hợp với Telegram và AI
- **Bot đơn lẻ:** Thiếu khả năng điều phối và học hỏi
- **Workflow cứng nhắc:** Không linh hoạt để xử lý ngôn ngữ tự nhiên
- **Thiếu tích hợp:** Không kết nối được với các hệ thống hiện có

### Urgency & Importance
- **Thị trường cạnh tranh:** Cần cải thiện dịch vụ để giữ chân khách hàng
- **Quy mô kinh doanh:** Số lượng yêu cầu tăng 200% mỗi năm
- **Yêu cầu khách hàng:** Đòi hỏi phản hồi nhanh và chính xác hơn

---

## Proposed Solution

### Core Concept & Approach
**Coordinator Pattern với AI Integration:**
- **Coordinator Bot:** Bot trung tâm điều khiển, phân tích intent và phân phối yêu cầu
- **Specialized Bots:** Các bot chuyên biệt cho từng đối tượng và chức năng
- **AI-Powered Intent Analysis:** Sử dụng Ollama để hiểu yêu cầu bằng ngôn ngữ tự nhiên
- **n8n Workflow Engine:** Nền tảng tự động hóa quy trình linh hoạt
- **Integrated Helpdesk:** Hệ thống hỗ trợ tích hợp với tracking và knowledge base

### Key Differentiators
- **Intent-based Routing:** Phân tích ngôn ngữ tự nhiên để hiểu chính xác yêu cầu
- **Coordinator Pattern:** Một bot trung tâm điều khiển toàn bộ hệ thống
- **Continuous Learning:** Feedback loop để cải thiện liên tục
- **Multi-channel Integration:** Tích hợp Telegram, web, email trong một hệ thống
- **Knowledge RAG:** Retrieval-Augmented Generation để cải thiện chất lượng trả lời

### Why This Solution Will Succeed
- **Proven Technology Stack:** n8n + Ollama + PostgreSQL đã được validate
- **Scalable Architecture:** Có thể mở rộng từ MVP lên production
- **User-Centric Design:** Tập trung vào trải nghiệm người dùng thực tế
- **Iterative Improvement:** Học hỏi và cải thiện liên tục

### High-Level Vision
Hệ thống hỗ trợ vận hành thông minh, tự động hóa 80% quy trình, giảm 60% thời gian xử lý, và tăng 40% độ chính xác, tạo ra trải nghiệm hỗ trợ xuất sắc cho tất cả đối tượng sử dụng.

---

## Target Users

### Primary User Segment: Admin & Operations Team

**Demographic/Firmographic Profile:**
- Nhân viên vận hành, quản lý dịch vụ
- Độ tuổi: 25-45
- Kinh nghiệm: 2-10 năm trong lĩnh vực telecom/finance
- Vị trí: Team lead, supervisor, operations manager

**Current Behaviors & Workflows:**
- Sử dụng Telegram để giao tiếp nội bộ
- Xử lý yêu cầu thủ công qua chat/email
- Tạo thông báo và gửi email thủ công
- Không có hệ thống tracking tập trung

**Specific Needs & Pain Points:**
- Cần gửi thông báo nhanh đến nhiều nhóm khác nhau
- Muốn theo dõi trạng thái xử lý yêu cầu
- Cần lưu trữ và tìm kiếm thông tin hiệu quả
- Muốn tự động hóa các tác vụ lặp đi lặp lại

**Goals:**
- Giảm thời gian xử lý yêu cầu
- Tăng độ chính xác trong việc phân phối
- Có cái nhìn tổng quan về tình trạng hệ thống
- Tự động hóa các quy trình đơn giản

### Secondary User Segment: Customer Support Agents

**Demographic/Firmographic Profile:**
- Nhân viên hỗ trợ khách hàng
- Độ tuổi: 22-35
- Kinh nghiệm: 1-5 năm trong customer service
- Vị trí: Customer support representative, helpdesk agent

**Current Behaviors & Workflows:**
- Sử dụng nhiều công cụ khác nhau (chat, email, phone)
- Không có access vào hệ thống log tập trung
- Phải chuyển yêu cầu phức tạp lên cấp cao hơn
- Không có knowledge base để tham khảo

**Specific Needs & Pain Points:**
- Cần access nhanh đến thông tin hệ thống
- Muốn xử lý yêu cầu phức tạp mà không cần chuyển tiếp
- Cần training và hướng dẫn liên tục
- Muốn tracking hiệu suất làm việc

**Goals:**
- Xử lý yêu cầu nhanh hơn
- Giảm số lượng yêu cầu chuyển tiếp
- Tăng kiến thức và kỹ năng
- Cải thiện độ hài lòng khách hàng

---

## Goals & Success Metrics

### Business Objectives
- **Tăng hiệu suất vận hành:** Giảm 60% thời gian xử lý yêu cầu (từ 2-4 giờ xuống 30-60 phút)
- **Giảm chi phí vận hành:** Giảm 40% số lượng nhân viên support cần thiết
- **Tăng độ hài lòng khách hàng:** Tăng từ 70-80% lên 90-95%
- **Mở rộng quy mô:** Hỗ trợ tăng 300% số lượng yêu cầu mà không cần tăng nhân sự

### User Success Metrics
- **Admin Efficiency:** Giảm 70% thời gian tạo và gửi thông báo
- **Agent Productivity:** Tăng 50% số lượng yêu cầu xử lý/ngày
- **Response Time:** Giảm 80% thời gian phản hồi ban đầu
- **Resolution Rate:** Tăng từ 75% lên 95% yêu cầu được giải quyết trong lần đầu

### Key Performance Indicators (KPIs)
- **First Response Time:** < 5 phút cho 95% yêu cầu
- **Resolution Time:** < 1 giờ cho 80% yêu cầu
- **Customer Satisfaction Score:** > 4.5/5.0
- **System Uptime:** > 99.5%
- **Intent Recognition Accuracy:** > 90%
- **Bot Response Accuracy:** > 85%

---

## MVP Scope

### Core Features (Must Have)

- **Coordinator Bot Core:**
  - Phân tích intent bằng Ollama
  - Phân phối yêu cầu đến bot phù hợp
  - Học hỏi từ feedback của admin
  - Xử lý ngôn ngữ tự nhiên tiếng Việt

- **Basic n8n Workflow Structure:**
  - Webhook endpoints cho Telegram
  - Workflow xử lý yêu cầu cơ bản
  - Integration với Ollama API
  - Error handling và logging

- **Helpdesk System:**
  - Database schema cho tickets, conversations, users
  - API endpoints cơ bản
  - Basic web UI cho admin
  - Ticket creation và tracking

- **Telegram Bot Integration:**
  - Bot cho nhóm admin
  - Bot cho nhóm khách hàng
  - Bot cho nhóm nhà cung cấp
  - Webhook handling

- **Intent Classification:**
  - Phân loại 5-10 loại yêu cầu cơ bản
  - Training data cơ bản cho Ollama
  - Feedback mechanism đơn giản

### Out of Scope for MVP
- Multi-language support (chỉ tiếng Việt)
- Advanced analytics và reporting
- Mobile app
- Integration với hệ thống bên thứ 3
- Advanced RAG với vector database
- Predictive analytics
- Multi-tenant architecture

### MVP Success Criteria
- Coordinator Bot có thể phân tích và phân phối 80% yêu cầu chính xác
- Hệ thống xử lý được 100 yêu cầu/ngày mà không bị lỗi
- Response time < 5 phút cho 90% yêu cầu
- Admin có thể tạo và gửi thông báo trong < 10 phút
- Helpdesk system tracking được 100% yêu cầu

---

## Post-MVP Vision

### Phase 2 Features
- **Advanced Intent Classification:** Mở rộng lên 20-30 loại yêu cầu
- **Knowledge Base RAG:** Tích hợp vector database và embedding
- **Multi-language Support:** Hỗ trợ tiếng Anh
- **Advanced Analytics:** Dashboard và báo cáo chi tiết
- **Mobile App:** Ứng dụng mobile cho admin và agent
- **Integration APIs:** Kết nối với hệ thống bên thứ 3

### Long-term Vision (1-2 năm)
- **Predictive Support System:** AI dự đoán vấn đề trước khi xảy ra
- **Autonomous Bot Learning:** Bot tự học và cải thiện hoàn toàn
- **Multi-tenant Architecture:** Hỗ trợ nhiều công ty khác nhau
- **Advanced AI Models:** Tích hợp với các AI model tiên tiến hơn
- **IoT Integration:** Kết nối với các thiết bị IoT để monitoring

### Expansion Opportunities
- **White-label Solution:** Cung cấp platform cho các công ty khác
- **Industry-specific Modules:** Module chuyên biệt cho từng ngành
- **Enterprise Features:** Tính năng enterprise (SSO, audit log, compliance)
- **Global Expansion:** Hỗ trợ nhiều ngôn ngữ và thị trường

---

## Technical Considerations

### Platform Requirements
- **Target Platforms:** Web (Chrome, Firefox, Safari), Telegram Bot API
- **Browser/OS Support:** Modern browsers (ES6+), Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Performance Requirements:** Response time < 2s cho web UI, < 5s cho bot response

### Technology Preferences
- **Frontend:** Vue.js 3 + Tailwind CSS (đã có sẵn trong project)
- **Backend:** Node.js + Express (đã có sẵn trong project)
- **Database:** PostgreSQL (đã có sẵn trong project)
- **Hosting/Infrastructure:** Docker + Docker Compose (đã có sẵn trong project)

### Architecture Considerations
- **Repository Structure:** Monorepo với frontend và backend riêng biệt
- **Service Architecture:** Microservices cho các component chính (coordinator, helpdesk, knowledge)
- **Integration Requirements:** n8n webhook, Ollama API, Telegram Bot API
- **Security/Compliance:** JWT authentication, HTTPS, data encryption

---

## Constraints & Assumptions

### Constraints
- **Budget:** Không có budget riêng, sử dụng resources hiện có
- **Timeline:** MVP trong 4-6 tuần, Phase 2 trong 2-3 tháng
- **Resources:** 1-2 developer, 1 business analyst
- **Technical:** Phải tương thích với hệ thống hiện có

### Key Assumptions
- Ollama có thể xử lý tiếng Việt hiệu quả
- n8n có thể handle được workload dự kiến
- Telegram Bot API đủ ổn định cho production
- Team có đủ kiến thức về các công nghệ được chọn
- Khách hàng sẵn sàng sử dụng bot thay vì con người

---

## Risks & Open Questions

### Key Risks
- **AI Model Performance:** Ollama có thể không đủ chính xác cho tiếng Việt
- **Scalability Issues:** n8n có thể không handle được số lượng yêu cầu lớn
- **Integration Complexity:** Tích hợp nhiều hệ thống có thể gặp khó khăn
- **User Adoption:** Admin và agent có thể không muốn sử dụng bot

### Open Questions
- Cần bao nhiêu training data để Ollama hoạt động hiệu quả?
- Làm thế nào để handle conflict khi nhiều bot muốn xử lý cùng yêu cầu?
- Cần bao nhiêu server resources cho production deployment?
- Làm thế nào để backup và restore data một cách an toàn?

### Areas Needing Further Research
- **Ollama Performance:** Test performance với tiếng Việt
- **n8n Scalability:** Benchmark với workload thực tế
- **Telegram Bot Limits:** Research về rate limits và best practices
- **Security Best Practices:** Research về security cho bot systems

---

## Appendices

### A. Research Summary
**Brainstorming Session Results:**
- Coordinator Bot pattern được xác định là giải pháp tối ưu
- Ollama đủ để xử lý intent analysis, không cần language parser phức tạp
- Hệ thống cần giới hạn loại yêu cầu để coordinator xử lý hiệu quả
- Feedback loop là chìa khóa để cải thiện hệ thống

**Technical Feasibility:**
- n8n có thể handle được workflow complexity
- Ollama có thể tích hợp dễ dàng qua API
- PostgreSQL đủ để handle data volume dự kiến
- Docker deployment đơn giản và scalable

### B. Stakeholder Input
**Business Team:**
- Cần giảm thời gian xử lý yêu cầu
- Muốn có tracking và reporting
- Cần tích hợp với hệ thống hiện có

**Technical Team:**
- Ưu tiên sử dụng công nghệ đã có sẵn
- Cần architecture scalable
- Muốn có testing và monitoring

### C. References
- [Brainstorming Session Results](docs/brainstorming-session-results.md)
- [n8n Documentation](https://docs.n8n.io/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## Next Steps

### Immediate Actions
1. **Setup Development Environment:** Cài đặt n8n, Ollama, và development tools
2. **Create Project Repository:** Setup project structure và basic configuration
3. **Design Database Schema:** Tạo database schema cho helpdesk system
4. **Setup Telegram Bots:** Tạo và configure các bot Telegram
5. **Create Basic n8n Workflow:** Tạo workflow cơ bản cho coordinator bot

### PM Handoff
Project Brief này cung cấp đầy đủ context cho **"Hệ thống hỗ trợ vận hành tập trung với AI"**. Vui lòng bắt đầu ở 'PRD Generation Mode', review kỹ lưỡng brief để làm việc với user tạo PRD section by section theo template, hỏi bất kỳ clarification cần thiết hoặc đề xuất cải thiện.

---

*Project Brief được tạo dựa trên BMAD-METHOD™ framework*
