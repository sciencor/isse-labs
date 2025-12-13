# Lab 6: Github Action 持续集成

## 步骤 0：仓库初始化

### 创建仓库

1. 从提供的[模板仓库](https://github.com/pku-software/isse-lab06)开始，点击仓库右上角的 `Use this template`
2. 基于模板创建自己的仓库，设置为 **私有仓库(private)**，这在后续步骤中具有重要作用

### 本地环境设置与测试

设置：
```bash
git clone <your-repository>
cd <your-repository>
python -m venv .venv
.venv\Scripts\activate  # Linux/MacOS: source .venv/bin/activate
pip install -r requirements.txt
```

测试：
```bash
python -m pytest --cov=prediction_pipeline_demo --cov-report=term-missing
```

通过搜索、查看输出及相关文件，理解输出含义。

## 步骤 1：初探 Github Actions 持续集成(CI)

1. 通读 `.github/workflows/ci.yml`，理解重要项目的含义；
2. 重点关注 "Run tests with coverage" 步骤，目前上述步骤实际上使用默认参数 `--cov-fail-under=50`，意为如果覆盖率在 50% 以下，则测试失败(fail)，反之测试成功；
3. 修改上述步骤，使得测试覆盖率在 70% 以下时测试失败，并**推送**到 Github，默认代码的覆盖率应当会失败(fail)，在 Github 上查看 Actions 结果；
4. 查看 `tests/test_prediction_pipeline_demo.py` 可以发现，两个测试函数没有具体实现，根据 TODO 的指示**完善**函数，重新运行测试，此时覆盖率应当合规；
5. 重新**推送**代码到 Github，此时测试应当成功(pass)。

## 步骤 2：在 Github Actions 工作流中增加 ML 流水线步骤

1. 修改 `.github/workflows/ci.yml` 的配置文件，根据 TODO 指示增加一个新步骤；
2. 新步骤名为 `Run demo pipeline end-to-end`，目标是直接运行 `prediction_pipeline_demo.py` 文件，从而输出模型的 R² 分数；
3. **推送**代码到 Github，检查日志以确定成功添加。

> 注：这一运行测试仅是作为作业的一部分，事实上，持续集成的任务应当为轻量的检查、测试验证工作。此处，样例流水线较小，因而其训练过程可以被集成，但实际生产中不应进行较大的工作。

## 步骤 3：设置 self-hosted 运行器

以上 Github Actions 的设置都会在 Github-hosted 的服务器上执行，接下来将会通过合适配置使得 CI 任务运行在本机的 self-hosted 运行器上。

1. 前往 **Settings → Actions → Runners → New self-hosted runner**；
2. 根据系统情况和指示完成操作，执行 config 配置命令并启动服务；
3. 更新工作流 yaml 文件，使得其任务运行在本地的运行器上；
4. 将 `Set up Python` 步骤替换为 `Show Python` 步骤，使用 `python3 --version` 命令展示本地的 python 版本；
5. 修改 `.gitignore` 文件，使得 actions 文件夹不要上传到 Github；
6. 将更新后的代码**推送**到 Github，检查 Actions 日志以确保其运行在本地机器上。

## 提交内容

1. 所有代码文件
2. 至少四张截图，包括每个步骤中提交后的 Actions 日志大致情况，其中还应当展示出步骤 3 中运行在本地环境而非 Github 托管环境

