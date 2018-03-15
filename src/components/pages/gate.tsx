import * as React from "react";
import { connect, actionCreatorsList, Dispatchers } from "../connect";

import LoginForm from "./gate/login-form";
import RememberedProfiles from "./gate/remembered-profiles";
import BlockingOperation from "./gate/blocking-operation";
import TitleBar from "../title-bar";
import Filler from "../basics/filler";

import { ISetupOperation, IRootState } from "../../types";

import styled from "../styles";

const GateDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100%;

  .logo {
    pointer-events: none;

    display: flex;
    flex-direction: row;
    align-items: center;

    margin: 40px 0;
    margin-top: 80px;
    min-height: 120px;

    img {
      width: 90%;
      margin: 0 auto;
    }
  }

  .crux {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-self: stretch;
    align-items: center;
  }
`;

const appWhite = require("../../static/images/logos/app-white.svg");

export class GatePage extends React.PureComponent<IProps & IDerivedProps> {
  username: HTMLInputElement;
  password: HTMLInputElement;

  render() {
    return (
      <GateDiv>
        <TitleBar tab="login" />
        <section className="logo">
          <img src={appWhite} />
        </section>
        <Filler />
        <section className="crux">{this.renderChild()}</section>
        <Filler />
      </GateDiv>
    );
  }

  renderChild() {
    const { blockingOperation, stage } = this.props;

    if (blockingOperation) {
      return <BlockingOperation blockingOperation={blockingOperation} />;
    }

    if (stage === "pick") {
      return <RememberedProfiles />;
    } else {
      return <LoginForm />;
    }
  }
}

interface IProps {}

const actionCreators = actionCreatorsList(
  "loginWithPassword",
  "useSavedLogin",
  "loginStartPicking",
  "loginStopPicking",
  "forgetProfileRequest",
  "retrySetup",
  "openUrl"
);

type IDerivedProps = Dispatchers<typeof actionCreators> & {
  stage: string;
  errors?: string[];
  blockingOperation?: ISetupOperation;
};

export default connect<IProps>(GatePage, {
  state: (rs: IRootState): Partial<IDerivedProps> => {
    const { profile } = rs;
    const { login } = profile;

    if (!rs.setup.done) {
      return {
        stage: "setup",
        errors: rs.setup.errors,
        blockingOperation: rs.setup.blockingOperation,
      };
    }

    const stage = login.picking ? "pick" : "login";
    return { stage, blockingOperation: login.blockingOperation };
  },
  actionCreators,
});
