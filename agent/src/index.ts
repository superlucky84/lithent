export { createAgentBridge, defaultAgentBridge } from '@/bridge';
export { agentAction, agentState, AgentScope, useAgentBridge } from '@/hooks';
export { connectWebMCP } from '@/webmcp';
export type {
  ActionConfirmContext,
  ActionConfirmHandler,
  WebMCPTool,
  WebMCPModelContext,
  ConnectWebMCPOptions,
  ParamConstructor,
  ParamFieldSpec,
  ParamSpec,
  ParamsOf,
  ParamIssue,
  AgentActionOptions,
  AgentStateOptions,
  CreateAgentBridgeOptions,
  ToolDescriptor,
  ToolCallResult,
  AgentBridgeEvent,
  AgentBridge,
} from '@/types';
