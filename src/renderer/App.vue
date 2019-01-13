<template>
  <div id="app">
    <van-nav-bar title="FRP UI"></van-nav-bar>
    <section class="block">
      <h2 class="block__title">公共配置</h2>
      <van-cell-group>
        <van-field type="text" v-model="config.common.server_addr" clearable label="地址"/>
        <van-field type="number" v-model="config.common.server_port" clearable label="端口"/>
        <van-field type="text" v-model="config.common.token" clearable label="令牌"/>
      </van-cell-group>
    </section>
    <section class="block">
      <h2 class="block__title">基本配置</h2>
      <van-cell-group>
        <van-field type="text" v-model="config.base.type" clearable label="类型"/>
        <van-field type="text" v-model="config.base.local_ip" clearable label="地址"/>
        <van-field type="number" v-model="config.base.local_port" clearable label="端口"/>
        <van-field type="text" v-model="config.base.custom_domains" clearable label="域名"/>
      </van-cell-group>
    </section>
    <section class="block">
      <van-button
        v-if="process"
        type="danger"
        style="border-left: none; border-right: none;"
        :block="true"
        @click="stop"
      >停止</van-button>

      <van-button
        v-else
        type="default"
        style="border-left: none; border-right: none;"
        :block="true"
        @click="start"
      >启动</van-button>
    </section>
  </div>
</template>

<script>
import { remote } from "electron";
import { exec } from "child_process";
import { join } from "path";
import fs from "fs-extra";
import ini from "ini";
import md5 from "md5";

export default {
  data() {
    return {
      process: null,
      config: JSON.parse(localStorage.getItem("config")) || {
        common: {
          server_addr: "",
          server_port: 7000,
          token: ""
        },
        base: {
          type: "http",
          local_ip: "127.0.0.1",
          local_port: 80,
          custom_domains: "custom.domain.com"
        }
      }
    };
  },
  methods: {
    async start() {
      localStorage.setItem("config", JSON.stringify(this.config));

      const frpDir = join(remote.app.getPath("userData"), "frp");
      const frpExecPath = join(frpDir, `frpc`);
      const frpConfigPath = join(frpDir, `frpc.ini`);

      // 配置文件夹不存在就创建
      if (!(await fs.exists(frpDir))) {
        await fs.mkdirp(frpDir);
      }

      // 生成配置
      fs.writeFileSync(
        frpConfigPath,
        ini.stringify({
          common: this.config.common,
          [md5(this.config.base)]: this.config.base
        }),
        "utf-8"
      );

      this.process = exec(`"${frpExecPath}" -c "${frpConfigPath}"`);
      this.process.on("exit", () => (this.process = null));
    },
    async stop() {
      this.process.kill();
    }
  }
};
</script>

<style lang="scss">
body {
  background-color: #fafafa;
  font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue",
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
}

.block {
  padding-top: 15px;

  &__title {
    margin: 0;
    font-weight: 400;
    font-size: 14px;
    color: rgba(69, 90, 100, 0.6);
    padding: 15px;
    padding-top: 0;
  }
}
</style>
