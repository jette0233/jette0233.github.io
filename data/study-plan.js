window.STUDY_PLAN = {
  "version": 1,
  "title": "计算所实习：传统全栈复盘任务清单",
  "sourceFile": "content/计算所实习_传统全栈复盘任务清单.md",
  "sourceUpdatedAt": "2026-08-23T12:27:09.313Z",
  "taskCount": 69,
  "recommendedOrder": [
    "三个项目的数据链路、架构图与代码证据。",
    "MySQL 事务、索引、MVCC 与锁。",
    "Spring MVC、AOP 事务与 MyBatis。",
    "Java 集合、异常、并发与 JVM。",
    "HTTP、Nacos、Feign 与 Flask 工程化。",
    "北中医数据建模与 Excel 导入。",
    "考古瓦片、LOD、坐标与事件系统。",
    "Git、Linux、Docker、日志与基础算法。"
  ],
  "notices": [
    {
      "id": "notice-142dwh6",
      "title": "使用原则",
      "items": [
        "每项任务必须产出笔记、代码、图或口头回答之一，单纯“看过”不算完成。",
        "项目回答统一采用：背景与约束 -> 我的职责 -> 方案 -> 结果 -> 局限与改进。",
        "复盘范围只覆盖传统全栈与模型服务化；Agent、RAG、Prompt 和状态机放到课程设计专项。"
      ]
    },
    {
      "id": "notice-1j9hq5y",
      "title": "医疗智能诊断平台：事实边界",
      "items": [
        "既有 SSM / Spring Boot 平台和五个深度学习模型不是从零开发或训练的。",
        "个人核心贡献是 Flask 服务化、Nacos / OpenFeign 接入、前端复核流程和持久化衔接。",
        "`langchain4j-llm-rag` 属于学长工作；项目没有真实完成 Redis、Kafka、Sentinel 和性能压测。",
        "五模型没有显式实现轮询负载均衡；放射科批准 / 驳回也没有形成完整持久化状态机。"
      ]
    },
    {
      "id": "notice-eyh9zv",
      "title": "考古玉器数字化平台：事实边界",
      "items": [
        "Python 版是早期探索，Java 版是导师要求下的主系统方案。",
        "金字塔瓦片方案来自调研；Nexus 是外部 C++ 库，个人贡献是选型、接入和效果验证。",
        "八叉树与 Cesium 跑过对照实验，但没有开发底层渲染引擎或 Nexus 算法。",
        "1% 是实际测量误差结果；没有正式记录的数据不写成首屏耗时或吞吐指标。"
      ]
    },
    {
      "id": "notice-1ws21b5",
      "title": "北中医临床数据平台：事实边界",
      "items": [
        "个人贡献集中在需求沟通、患者与检查数据建模、字段口径和 Excel 映射方案。",
        "整个 Spring Boot + Vue 平台、权限体系和部署体系不是个人独立完成。",
        "只有能够完整解释校验、事务与回滚流程时，才在面试中展开批量导入方案。"
      ]
    },
    {
      "id": "notice-s4u1pn",
      "title": "面试红线",
      "items": [
        "不声称从零开发完整医疗平台、训练五个模型或独立完成北中医整个平台。",
        "不声称通过 Redis、Kafka、Sentinel 实现高并发治理，也不使用虚构的 QPS、TPS 和响应时间。",
        "不声称五模型采用轮询负载均衡或完整实现放射科审批状态持久化。",
        "不声称开发 Nexus、八叉树或底层图形引擎。",
        "被追问他人模块时，先明确协作边界，再回答自己理解的接口与原理。"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-63603e",
      "title": "项目答辩交付",
      "groups": [
        {
          "id": "group-5v01yi",
          "title": "核心材料",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-2bxefx",
              "text": "写出三个项目各自的 1 分钟和 3 分钟介绍，3 分钟版本必须包含一条完整数据链路。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1fgf3f1",
              "text": "为三个项目各画一张可在白板复现的架构图，并标出个人负责范围。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-lsgack",
              "text": "每个项目整理 2 个真实问题、解决过程、方案取舍和当前缺陷。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1e1x934",
              "text": "建立代码证据索引：简历中的每个核心动词都能定位到接口、类、表或页面。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-t24bwn",
              "text": "完成一次 30 分钟项目压力面试并记录未答稳的问题。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-sakte",
      "title": "医疗智能诊断平台",
      "groups": [
        {
          "id": "group-mbksfp",
          "title": "服务接入与数据链路",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-esrb5g",
              "text": "画出五类模型的输入、输出、HTTP 方法、端口、临时文件与 GPU 使用对照表。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1jkd9or",
              "text": "手写一个最小 Flask 推理服务，完成模型单次加载、参数校验、异常处理和结构化响应。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-falbcg",
              "text": "画出 Spring Boot 经 Nacos 发现 Flask 服务并由 OpenFeign 发起调用的完整链路。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-bbe16c",
              "text": "解释注册、发现、心跳、实例摘除、注销和多实例负载均衡之间的关系。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1dthbro",
              "text": "为五类模型设计统一 API 契约、错误码、请求 ID、超时和日志字段。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-8p3wqa",
          "title": "人工复核与可靠性",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1bij414",
              "text": "画出推理、医生修改确认、consultation 主表与专科表事务入库流程。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-2cg8f9",
              "text": "解释远程模型调用为什么不应置于长事务，以及本地多表写入为什么需要事务。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-hu48b4",
              "text": "复现实验 `@Transactional` 的正常回滚、异常被吞和同类内部调用失效场景。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1fn433y",
              "text": "为重复确认设计幂等键、唯一约束和结果复用方案。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-724t3v",
              "text": "为放射科补画待推理、待复核、已确认、已拒绝、保存失败状态机。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-h1cu2s",
      "title": "考古玉器数字化平台",
      "groups": [
        {
          "id": "group-5obsfh",
          "title": "二维瓦片与三维 LOD",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-ge8zw4",
              "text": "画出视口变化、计算 `{z}/{x}/{y}`、拼接路径、请求瓦片和浏览器缓存的链路。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-3da4y1",
              "text": "解释只保存路径模板与元数据的收益，以及文件迁移、瓦片缺失和版本一致性问题。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1xx9pzt",
              "text": "说明瓦片大小、层级数量、预加载、并发请求、首屏速度与清晰度的取舍。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1u5op9h",
              "text": "对比八叉树、Cesium 与 Nexus 的首次加载、近景精度、视觉缺陷和接入成本。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1eqtfmc",
              "text": "解释 LOD、屏幕误差、摄像机距离与视锥剔除各自解决的问题。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-10q0c5r",
          "title": "测量、坐标与标注",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1x4ktj3",
              "text": "推导像素距离到现实距离的换算公式，并明确 1% 误差的真值与测试口径。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-tugvqq",
              "text": "画出屏幕坐标、图像坐标和原图像素坐标在缩放平移后的转换过程。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-12xxqzb",
              "text": "复现标注与视角拖动的事件冲突，并用编辑模式或 Pointer Events 分离交互。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-psylut",
      "title": "北中医临床数据平台",
      "groups": [
        {
          "id": "group-1mte4mu",
          "title": "数据建模",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-khhes9",
              "text": "画出患者、检查记录、科室来源与具体诊疗数据的简化 ER 图。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-159rpbg",
              "text": "解释 `patient_id`、`record_id`、`source`、`exam_no` 的业务含义与约束。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1fdfzlx",
              "text": "设计同名患者、多次检查、信息纠错和重复数据的识别策略。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1u2wbug",
              "text": "用真实字段说明一对一、一对多、唯一约束、三范式和适度反范式。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-msgsy3",
          "title": "Excel 导入",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-19ek10a",
              "text": "画出三级表头到关系表字段的映射、类型校验、冲突检测和错误报告流程。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1o7175d",
              "text": "对比整表事务与分批事务，并设计导入幂等键和失败重试方案。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-8ffnfm",
              "text": "手写一个最小 Excel 批量导入程序，覆盖合并单元格、空值、日期和重复上传测试。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-e4o1rn",
      "title": "Java 与 JVM",
      "groups": [
        {
          "id": "group-1b06s5u",
          "title": "Java 核心",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-ublz70",
              "text": "手写一个 Java 小程序，覆盖集合、泛型、参数校验、异常处理、equals 与 hashCode。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-ipdsg2",
              "text": "解释并实测 HashMap 的结构、扩容、冲突处理及与 ConcurrentHashMap 的区别。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-7juh7u",
              "text": "完成 synchronized、volatile、Lock、原子类和线程池的最小并发实验。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1hyxpx6",
              "text": "分析模型推理任务的线程池参数、排队、拒绝策略和无限建线程风险。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-12lvvwe",
          "title": "JVM 核心",
          "priority": "P1",
          "tasks": [
            {
              "id": "task-qgden7",
              "text": "画出运行时内存区域，并区分栈溢出、堆 OOM、元空间 OOM 和内存泄漏。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-sjuf81",
              "text": "解释类加载、双亲委派、对象创建到回收的过程。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-1b0z77o",
              "text": "对比复制、标记清除、标记整理以及 Serial、Parallel、CMS、G1 的适用差异。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-1a6x0ro",
              "text": "用 happens-before 解释可见性、有序性和 `volatile` 不能保证 `count++` 原子性的原因。",
              "priority": "P1",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-18w1tdd",
      "title": "Spring 与 MyBatis",
      "groups": [
        {
          "id": "group-zozsya",
          "title": "框架链路",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1xw7r1g",
              "text": "手写最小 Spring Boot + MyBatis CRUD，包含 Controller、Service、Mapper、校验和全局异常处理。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1wh225o",
              "text": "解释 IoC、DI、AOP、Bean 生命周期、默认作用域和线程安全问题。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-5txgk5",
              "text": "画出一次 Spring MVC 请求从过滤器到 Controller、Service、Mapper 和数据库的链路。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-uemnnz",
              "text": "解释 JDK / CGLIB 动态代理以及 Feign、MyBatis 接口无实现类仍能工作的原因。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-q9py1i",
              "text": "用实际 SQL 说明 `#{}`、`${}`、resultMap、动态 SQL、分页和 N+1 查询问题。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-xdlury",
      "title": "MySQL",
      "groups": [
        {
          "id": "group-14fvhqj",
          "title": "索引与 SQL",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-13dl2wc",
              "text": "解释 B+ 树、聚簇索引、二级索引、回表、覆盖索引和联合索引最左匹配。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-ygi2xy",
              "text": "为患者查询和检查记录查询设计索引，并使用 `EXPLAIN` 验证。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1hyt7st",
              "text": "手写 JOIN、聚合、查重、Top N、保留最新记录和深分页优化 SQL。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-fz4yuv",
          "title": "事务、MVCC 与锁",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1k0n6t4",
              "text": "解释 ACID、四种隔离级别以及脏读、不可重复读和幻读。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-xnsd16",
              "text": "画出 InnoDB 版本链、undo log、Read View 与 MVCC 可见性判断。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-zm3rim",
              "text": "区分 redo log、undo log、binlog、行锁、间隙锁、临键锁、乐观锁与悲观锁。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-jue3yy",
              "text": "复现一次主子表回滚和一次并发死锁，并说明检测与规避方法。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-oult5g",
      "title": "HTTP、接口与模型服务",
      "groups": [
        {
          "id": "group-cgy1vl",
          "title": "网络与 API",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1c1m9hu",
              "text": "解释从输入 URL 到 HTTP 响应的 DNS、TCP、TLS、代理与应用处理链路。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1iyoulp",
              "text": "设计图片、视频和 Excel 上传接口，说明 JSON、查询参数和 multipart 的边界。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1vwrtr1",
              "text": "为同步推理与异步任务分别设计 API，并处理超时、重试、重复提交和任务查询。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-16drsb2",
              "text": "解释 Cookie、Session、JWT、CORS、401、403、409、429、502、503、504。",
              "priority": "P0",
              "completed": false
            }
          ]
        },
        {
          "id": "group-2p7wh2",
          "title": "Flask 服务工程化",
          "priority": "P1",
          "tasks": [
            {
              "id": "task-1bsdd3f",
              "text": "用 Gunicorn 部署 Flask 服务，并解释 worker 数、模型内存、GPU 显存和请求排队。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-am1xx0",
              "text": "为 URL 下载输入补齐 SSRF 防护、白名单、超时、大小限制、MIME 校验和临时文件清理。",
              "priority": "P1",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-heaykw",
      "title": "工程化与排障",
      "groups": [
        {
          "id": "group-1xfof6o",
          "title": "部署与诊断",
          "priority": "P1",
          "tasks": [
            {
              "id": "task-o6zmt2",
              "text": "为 Spring Boot 与 Flask 服务分别编写最小 Dockerfile，并完成本地构建运行。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-1u1hlzc",
              "text": "配置一次 Nginx 反向代理，验证 HTTPS、上传大小、超时和静态资源缓存。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-1jy50bf",
              "text": "按“浏览器 -> Java -> Flask -> OSS / DB”完成一次分段故障定位并整理日志证据。",
              "priority": "P1",
              "completed": false
            },
            {
              "id": "task-s9zu5b",
              "text": "掌握 Git 分支、merge、rebase，以及 Linux 进程、端口、磁盘、日志和权限排查命令。",
              "priority": "P1",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-2ptvww",
      "title": "算法与手写",
      "groups": [
        {
          "id": "group-ddngk1",
          "title": "必做能力",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-1ro0t7x",
              "text": "用 Java 完成数组 / 哈希、双指针、滑动窗口各 3 道典型题。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-j0bk2o",
              "text": "完成链表、二叉树、堆、二分、栈 / 队列各 2 道典型题。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-14xx9mo",
              "text": "完成动态规划 3 题与 SQL 5 题，主动说明复杂度和边界条件。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1yzsf54",
              "text": "手写线程安全单例、生产者消费者和带事务的主子表保存伪代码。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-aqoxfp",
              "text": "完成两次 45 分钟限时中等题，禁止 AI 补全并复盘错误。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "id": "section-1b0z0ks",
      "title": "投递验收",
      "groups": [
        {
          "id": "group-172miah",
          "title": "验收门槛",
          "priority": "P0",
          "tasks": [
            {
              "id": "task-92bpo4",
              "text": "三个项目都能脱稿讲满 3 分钟，并能稳定划分个人与团队贡献。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1lthwvb",
              "text": "每个项目的两条核心链路都能连续承受三层追问。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-1e35mtp",
              "text": "Java、Spring、MySQL、HTTP 的 P0 项完成率达到 90%。",
              "priority": "P0",
              "completed": false
            },
            {
              "id": "task-t7bge9",
              "text": "完成一次完整模拟面试：30 分钟项目、20 分钟八股、45 分钟手写。",
              "priority": "P0",
              "completed": false
            }
          ]
        }
      ]
    }
  ]
};
