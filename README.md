<a href="https://bkroland.vercel.app">
  <img src="./assets/hero.svg" width="100%" alt="Bukenya Kizza Roland, Senior DevOps & Full-Stack Engineer. I build public-health and SaaS platforms that keep working through outbreaks, 2G networks and offline clinics." />
</a>

<p align="center">
  <a href="https://www.linkedin.com/in/bukenyaroland"><img src="https://img.shields.io/badge/LinkedIn-1E163A?style=for-the-badge&logo=linkedin&logoColor=00FFC8" alt="LinkedIn" /></a>
  <a href="https://bkroland.vercel.app"><img src="https://img.shields.io/badge/Portfolio-1E163A?style=for-the-badge&logo=vercel&logoColor=00FFC8" alt="Portfolio" /></a>
  <a href="mailto:bkroland19@gmail.com"><img src="https://img.shields.io/badge/Email-1E163A?style=for-the-badge&logo=gmail&logoColor=00FFC8" alt="Email" /></a>
  <a href="https://x.com/bkroland19"><img src="https://img.shields.io/badge/X-1E163A?style=for-the-badge&logo=x&logoColor=00FFC8" alt="X" /></a>
  <img src="https://img.shields.io/badge/open_to-remote_roles_%C2%B7_consulting-00FFC8?style=for-the-badge&labelColor=0A081E" alt="Open to remote roles and consulting" />
</p>

I build and run software for places where failure is expensive: national disease surveillance, health workers on 2G networks, clinics that go offline. I built Uganda's **national Ebola Alerts Management System** ([alerts.health.go.ug](https://alerts.health.go.ug)), which was in operational use during the 2026 outbreak response.

I own the whole path. That means **Go and NestJS** services, **Next.js / React / Angular** front ends and **PostgreSQL** schemas. Underneath them sit **Terraform, Docker and GitHub Actions**, and on top sit **AI agents** wired up with RAG and MCP.

<img src="./assets/terminal.svg" width="100%" alt="Terminal: docker ps listing ebola-alerts, ussd-capture, dhis2-bridge, mediguide, agent-runtime and infra, all Up." />

## 🛰️ Flagship work

<table>
<tr>
<td width="50%" valign="top">

### 🦠 National Ebola Alerts System
<sub><code>Go Fiber</code> <code>Next.js</code> <code>MariaDB</code> <code>JWT / RBAC</code></sub>

I turned Uganda's **Event-Based Surveillance guidelines** into software. It takes in signals from several reporting channels and removes duplicates. A verification workflow promotes a signal to a validated alert, and the case is tracked through to resolution. It runs on Ministry-controlled national infrastructure.

**→ [alerts.health.go.ug](https://alerts.health.go.ug)**

</td>
<td width="50%" valign="top">

### 📶 Health data that survives 2G
<sub><code>USSD</code> <code>DHIS2</code> <code>JMS</code> <code>Dashboards</code></sub>

I built **USSD data capture**, so health workers without smartphones or reliable data can file structured, validated reports. DHIS2 and JMS message flows feed real-time monitoring and incident dashboards across systems that have different schemas and update cadences.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🧠 AI agents in production
<sub><code>MCP</code> <code>RAG</code> <code>Tool calling</code> <code>PostgreSQL</code></sub>

I work on a **multi-tenant SaaS** where every read path is provably scoped to its tenant. Ingestion pipelines pull from several upstream systems, normalise the data and feed it to **RAG and multi-agent workflows**. Those workflows use tool calling, conversational memory and production **MCP** servers.

</td>
<td width="50%" valign="top">

### ☁️ Platform & delivery
<sub><code>Terraform</code> <code>AWS</code> <code>Docker</code> <code>GitHub Actions</code></sub>

My **AWS environments are managed with Terraform**. Containerised services ship through CI/CD and run the same way in dev, staging and prod. I also self-host real-time comms (XMPP with STUN/TURN for video). Every incident ends with a write-up and a hardening fix.

</td>
</tr>
</table>

## 🧪 Public builds

| | Project | What it does | Stack |
|:-:|---|---|---|
| 🧫 | **[combined-pps](https://github.com/Bkroland19/combined-pps)** | Point Prevalence Survey platform for hospital antimicrobial-use surveillance: CSV ingest, relational API and an analytics dashboard | Go · Gin · GORM · PostgreSQL · Next.js · Docker |
| 💊 | **[mediguide-pos](https://github.com/Bkroland19/mediguide-pos)** | Clinical-guidance platform for the Ministry of Health: typed API, AI/RAG ingestion worker and an offline-first Flutter app | Go · Flutter · Docker Compose |
| 🚚 | **[last-mile-condom-distribution](https://github.com/Bkroland19/last-mile-condom-distribution)** · [live ↗](https://last-pi.vercel.app) | Last-mile health-commodity distribution tracking on GIS maps, with offline caching | React · Redux Toolkit · ArcGIS / Leaflet · Docker |
| 📊 | **[uphia-dashboard](https://github.com/Bkroland19/uphia-dashboard)** | Analytics over Uganda Population-based HIV Impact Assessment survey data, spread across several MySQL databases | Next.js · MySQL · Recharts |
| 🧩 | **[micro-frontend-archictecture](https://github.com/Bkroland19/micro-frontend-archictecture)** | A container shell composing independently deployed cart and product micro-frontends at runtime, the architecture I took to production at Autosoft | JavaScript · Webpack 5 Module Federation |
| 🎟️ | **[Go-GIN-AuTH](https://github.com/Bkroland19/Go-GIN-AuTH)** | Event-booking REST API with JWT auth middleware, registration and cancellation flows | Go · Gin · SQLite |

## 🧰 Toolbox

<table>
<tr><td><b>Cloud &amp; DevOps</b></td><td><img src="https://skillicons.dev/icons?i=aws,terraform,docker,githubactions,linux,nginx,vercel,bash&theme=dark" alt="AWS, Terraform, Docker, GitHub Actions, Linux, Nginx, Vercel, Bash" /></td></tr>
<tr><td><b>Backend &amp; data</b></td><td><img src="https://skillicons.dev/icons?i=go,nodejs,nestjs,ts,graphql,postgres,mysql,mongodb,redis&theme=dark" alt="Go, Node.js, NestJS, TypeScript, GraphQL, PostgreSQL, MySQL, MongoDB, Redis" /></td></tr>
<tr><td><b>Frontend &amp; mobile</b></td><td><img src="https://skillicons.dev/icons?i=react,nextjs,angular,redux,tailwind,flutter,firebase,figma&theme=dark" alt="React, Next.js, Angular, Redux, Tailwind, Flutter, Firebase, Figma" /></td></tr>
<tr><td><b>AI &amp; health interop</b></td><td><code>MCP</code> <code>RAG</code> <code>multi-agent orchestration</code> <code>tool calling</code> <code>HL7 FHIR</code> <code>DHIS2</code> <code>USSD</code></td></tr>
</table>

## 🩺 Vital signs

<a href="https://github.com/Bkroland19?tab=overview">
  <img src="https://raw.githubusercontent.com/Bkroland19/Bkroland19/output/vitals.svg" width="100%" alt="Vital signs: weekly GitHub activity drawn as an ECG trace, with contribution totals and streaks." />
</a>
<p align="center"><sub>Each heartbeat is one week of commits, so quiet weeks flatline. A <a href=".github/workflows/vitals.yml">GitHub Action</a> in this repo redraws it every 6 hours.</sub></p>

## 📡 Right now

- 🛠️ **Running** production infrastructure for health and SaaS platforms on AWS and VPS fleets
- 🤖 **Building** multi-agent systems with MCP + RAG that do real work, not demos
- 🎓 **Trained** in HL7 FHIR at a Ministry of Health bootcamp, for interoperability between national health systems
- 🤝 **Open to** senior DevOps, platform and full-stack roles (remote) and consulting engagements
- 💬 **Ask me about** disease-surveillance systems, DHIS2, USSD, Terraform, or making software behave on bad networks
- ⚡ **Fun fact:** some of my most important users never see a screen. They dial a USSD code.

<img src="./assets/footer.svg" width="100%" alt="" />

<p align="center"><sub>Kampala, Uganda · UTC+3 · 🇺🇬</sub></p>
