import type { SSTConfig } from "sst";
import { SvelteKitSite, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "digi-inno-passkeys",
      region: "us-east-1",
      profile: "pbs-digi-innovation",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const table = new Table(stack, "Users", {
        fields: {
          id: "string",
          username: "string",
        },
        primaryIndex: {
          partitionKey: "username",
        },
      });
      const site = new SvelteKitSite(stack, "site", {
        customDomain: "passkey-proto.digi-innovation.pbs.org",
        bind: [table],
      });
      site.attachPermissions([table]);
      stack.addOutputs({
        url: site.url,
        tableArn: table.tableArn,
      });
    });
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
  },
} satisfies SSTConfig;
