import { Watcher } from "common/util/watcher";

import urlParser from "url";

import rootLogger from "common/logger";
const logger = rootLogger.child({ name: "reactors/url" });

import urls from "common/constants/urls";

import { shell } from "electron";

import { actions } from "common/actions";
import { Store } from "common/types";

import { reportIssue } from "main/crash-reporter";
import { isItchioURL } from "common/util/url";

export default function(watcher: Watcher) {
  watcher.on(actions.processUrlArguments, async (store, action) => {
    const { args } = action.payload;
    for (const uri of args) {
      if (isItchioURL(uri)) {
        store.dispatch(actions.handleItchioURI({ uri }));
        break;
      }
    }
  });

  watcher.on(actions.openInExternalBrowser, async (store, action) => {
    const uri = action.payload.url;
    shell.openExternal(uri);
  });

  watcher.on(actions.handleItchioURI, async (store, action) => {
    const { uri } = action.payload;

    const { profile } = store.getState().profile;
    if (profile) {
      handleItchioUrl(store, uri);
    } else {
      logger.info(`Queuing ${uri} for later...`);
      store.dispatch(actions.pushItchioURI({ uri }));
    }
  });

  watcher.on(actions.loginSucceeded, async (store, action) => {
    const uris = store.getState().profile.itchioUris;
    store.dispatch(actions.clearItchioURIs({}));

    for (const uri of uris) {
      handleItchioUrl(store, uri);
    }
  });

  watcher.on(actions.viewCreatorProfile, async (store, action) => {
    const url = store.getState().profile.profile.user.url;
    store.dispatch(actions.navigate({ window: "root", url }));
  });

  watcher.on(actions.viewCommunityProfile, async (store, action) => {
    const url = store.getState().profile.profile.user.url;
    const host = urlParser.parse(url).hostname;
    const slug = /^[^.]+/.exec(host);
    store.dispatch(
      actions.navigate({
        window: "root",
        url: `${urls.itchio}/profile/${slug}`,
      })
    );
  });

  watcher.on(actions.reportIssue, async (store, action) => {
    // TODO: that's dirty, just make sure every time we call reportIssue, we have
    // a non-null payload
    const { log: issueLog } = action.payload || { log: null };

    reportIssue({
      body: "Dear itch app team, ",
      log: issueLog,
    });
  });
}

function handleItchioUrl(store: Store, uri: string) {
  logger.info(`Processing itchio uri (${uri})`);
  store.dispatch(actions.navigate({ window: "root", url: uri }));
}