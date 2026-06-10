# Smart Mobility — Knowledge Document

> Source: Alstom internal documentation (Robot Underframe Inspection one-pager + Smart Mobility overview)
> Booth: Smart Mobility (Innovation Station, Singapore)

---

## 1. Pillar mission

Smart Mobility is **changing the way we move** by applying the latest technologies — including **computer vision, generative AI, IoT, immersive tech, and robotics** — to a wide variety of rail applications.

Alstom's Smart Mobility approach is built on the conviction that the future of rail will be **safer, faster, and more appealing**. We are shaping this future not alone, but with a network of **customers, suppliers, startups, and universities**, ensuring our solutions are more connected, user-centric, and fitted to the needs and opportunities of everyone — from passengers to operators.

The Smart Mobility booth at the Innovation Station is the most **cross-cutting** of the four booths. It hosts a rotating mix of tangible demos, prototypes, and conceptual projects depending on what is most active at any given moment.

## 2. Technology stack used by Smart Mobility projects

The Smart Mobility pillar pulls from a wide range of technologies, including but not limited to:

- **Augmented Reality (AR)** — for subsystem maintenance support and remote assistance
- **Computer vision** — for visual inspection, defect detection, and safety
- **Generative AI** — for documentation, customer service, and design ideation
- **IoT (Internet of Things)** — for connected rolling stock, infrastructure, and depot equipment
- **Robotics** — for inspection, maintenance, and increasingly for assembly
- **Digital twins** — to simulate operational scenarios and design new solutions
- **Machine learning** — for predictive maintenance and energy optimisation

Examples mentioned in Alstom communications include AR-powered subsystems, robots assembling parts of trains, and digital twins used to create new generations of trains.

## 3. Flagship project — Robot Underframe Inspection

### What it is
A **remotely operated robot** that performs inspections of the **underframe of a train (the underside)** after a "strike" — an incident where a train hits an obstacle on the track (debris, vegetation, animal, etc.).

### The operational problem it solves
A "strike" doesn't always cause critical damage. In fact, looking at one specific operator's data:

- **70% of strikes in Queensland (Australia) do NOT require the train to return to depot immediately.**

But how do you know which 30% need urgent attention and which 70% can keep running? Today, the standard reaction is conservative: pull the train out of service, send it back to depot, perform a manual underframe inspection by a technician, then return it to service. This causes **maintenance disruption** and **loss of train availability** — even when the strike turned out to be minor.

### How the robot works
The robot is a **small tracked vehicle** (similar in form factor to a bomb-disposal robot, but railway-purpose-built) that can be deployed at trackside. It crawls under the train and uses onboard sensors to inspect the underframe. The data is reviewed remotely by a maintenance expert, who decides whether the train needs further intervention or can continue in service.

### Components

**Existing bricks (already developed):**
- Hardware (the robot platform itself)
- Onboard software
- Data model for capturing and structuring inspection results

**To be built:**
- Improved hardware (better sensors, better mobility)
- Improved software (more autonomous decision support)

**Short-term roadmap:**
- Software maintenance
- Optional cloud data management for fleet-wide analytics

### Benefits

**For Alstom:** Improved maintenance efficiency and reduced maintenance disruption.

**For the operator:** Higher train availability — more trains in service, fewer cancellations.

### Talking point for Kai
"The Underframe Inspection Robot is a small example of how robotics can solve a very specific operational pain point. 70% of train strikes don't actually need a return to depot — but you have to be sure. A robot trackside inspection in 15 minutes is much better than pulling the train out of service for half a day."

## 4. Other Smart Mobility themes Kai may encounter

While the Robot Underframe Inspection is the lead Smart Mobility demo at the Innovation Station, visitors may also ask about adjacent Alstom Smart Mobility solutions at the **corporate level**. Kai can mention the following high-level products, but should not pretend deep technical expertise — handing off to a human expert is preferable.

### Urbalis Fluence — train-centric CBTC signalling
Computer-Based Train Communication (CBTC) signalling that allows trains to **talk to each other directly** instead of waiting for trackside-system commands. Benefits include:

- **Headways as small as 60 seconds**
- Transport **capacity increased by up to 20%**
- Lifecycle **energy consumption reduced by 30%**

### HealthHub — predictive maintenance platform
A **cloud-based platform** that collects hundreds of real-time messages from rolling stock and infrastructure, then transforms them into **predictive maintenance insights**.

- **Service downtime reduced by up to 30%**
- **Scheduled inspection intervals stretched** from 3 months to **5 months**

### ARTE — Autonomous Regional Train Evolution
A project (currently in testing) that supports the **digitalisation of the German rail network** through **automated train operations (ATO)** using the European Train Control System (ETCS), without the need for additional trackside equipment. ARTE also includes **Remote Train Operations (RTO)** — a remote "driver" can control the train using a simple tablet.

### Autonomous mobility — the long arc
Driverless metros have existed since the 1980s. Today the technology is mature: Singapore's North-East Line is fully automated. The next frontier is autonomous mainline operation, where projects like ARTE are paving the way.

## 5. Common visitor questions on Smart Mobility

**Q: What's the most "AI" thing you have here?**
A: At project level, Battery Useful Life Analytics (in Green Mobility booth) is a great AI showcase — physics-informed AI that predicts battery failures. At corporate level, HealthHub for predictive maintenance is the most mature.

**Q: Do trains drive themselves now?**
A: In urban metros, yes — Singapore's North-East Line has been driverless for over 20 years. On mainline rail, fully autonomous operation is still being developed; Alstom's ARTE project is leading that work in Germany.

**Q: Is rail behind aviation in automation?**
A: Different paradigm. Aviation focuses on assisting one pilot in a vast empty sky. Rail focuses on tightly controlled, signalling-driven networks — automation looks completely different. Modern CBTC signalling like Urbalis Fluence is already a form of automation: trains coordinate with each other, not with a human controller.

**Q: How does Smart Mobility connect with the other booths?**
A: It's the most cross-cutting pillar. For example, Battery Useful Life Analytics (in Green Mobility) uses AI — so it's also a Smart Mobility project. The boundary between booths is thematic, not technological.

**Q: Can the Innovation Station help with my startup / university collaboration?**
A: Absolutely — collaboration with startups, universities, and suppliers is part of what the Innovation Station is for. The right person to talk to is Lena, the station manager.

## 6. Roadmap and future direction

The Smart Mobility pillar is intentionally **open-ended**. Unlike Green Mobility (clear sustainability KPIs) or 3D Printing (a well-defined manufacturing technology), Smart Mobility is a **horizon scan** — Alstom continuously evaluates new technologies (LLMs, autonomous robotics, multimodal AI, edge computing) and integrates the ones that demonstrate clear operational value.

When Kai is asked about "what's next," safe directions to point to are:

- Wider deployment of computer vision for inspection (depots, stations, trackside)
- Integration of generative AI in customer-facing applications and design workflows
- More autonomous robotics for maintenance tasks
- Tighter integration of IoT data with predictive models

Kai should **not** make commitments about specific roadmap items or timelines.
