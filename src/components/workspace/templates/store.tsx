import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Card, Domain, ModuleKey, MotorType, Param, Template } from "./types";
import { SYSTEM_TEMPLATES } from "./defaults";

interface Ctx {
  templates: Template[];
  /** Last applied template id (for highlighting in picker only). */
  appliedId: string | null;
  /** Detached working copy — independent from any saved template. */
  active: Template;
  activeModule: ModuleKey;
  globalAdvanced: boolean;

  setActiveModule: (m: ModuleKey) => void;
  setGlobalAdvanced: (v: boolean) => void;

  /** Apply a template's content to the working state. The working state is then independent. */
  applyTemplate: (id: string) => void;
  /** Save the current working state as a new custom template. Returns the new id. */
  saveAsTemplate: (name: string, domain: Domain, motorType: MotorType) => string;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;

  toggleCardEnabled: (cardId: string) => void;
  toggleCardAdvanced: (cardId: string) => void;
  updateParam: (cardId: string, paramKey: string, value: Param["value"]) => void;
}

const TemplateContext = createContext<Ctx | null>(null);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

let nextId = 1;
const newId = () => `tpl-${Date.now()}-${nextId++}`;

const makeWorking = (src: Template): Template => ({
  ...clone(src),
  id: "__working__",
  name: "当前方案",
  isSystem: false,
  ownership: "personal",
});

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>(() => clone(SYSTEM_TEMPLATES));
  const [working, setWorking] = useState<Template>(() => makeWorking(SYSTEM_TEMPLATES[0]));
  const [appliedId, setAppliedId] = useState<string | null>(SYSTEM_TEMPLATES[0].id);
  const [activeModule, setActiveModule] = useState<ModuleKey>("em");
  const [globalAdvanced, _setGlobalAdvanced] = useState<boolean>(false);

  const setGlobalAdvanced = useCallback((v: boolean) => {
    _setGlobalAdvanced(v);
    setWorking((t) => ({
      ...t,
      modules: Object.fromEntries(
        Object.entries(t.modules).map(([k, m]) => [
          k,
          { cards: m.cards.map((c) => ({ ...c, advancedOpen: v })) },
        ]),
      ) as Template["modules"],
    }));
  }, []);

  const applyTemplate = useCallback(
    (id: string) => {
      const src = templates.find((t) => t.id === id);
      if (!src) return;
      setWorking(makeWorking(src));
      setAppliedId(id);
      setTemplates((p) =>
        p.map((t) => (t.id === id ? { ...t, usageCount: (t.usageCount ?? 0) + 1 } : t)),
      );
    },
    [templates],
  );

  const saveAsTemplate = useCallback(
    (name: string, domain: Domain, motorType: MotorType) => {
      const id = newId();
      const tpl: Template = {
        ...clone(working),
        id,
        name,
        domain,
        motorType,
        isSystem: false,
        usageCount: 0,
        createdAt: Date.now(),
      };
      setTemplates((p) => [tpl, ...p]);
      setAppliedId(id);
      return id;
    },
    [working],
  );

  const rename = useCallback((id: string, name: string) => {
    setTemplates((p) => p.map((t) => (t.id === id && !t.isSystem ? { ...t, name } : t)));
  }, []);

  const remove = useCallback((id: string) => {
    setTemplates((p) => {
      const tpl = p.find((t) => t.id === id);
      if (!tpl || tpl.isSystem) return p;
      return p.filter((t) => t.id !== id);
    });
    setAppliedId((cur) => (cur === id ? null : cur));
  }, []);

  const mutateCards = useCallback(
    (fn: (cards: Card[]) => Card[]) => {
      setWorking((t) => ({
        ...t,
        modules: { ...t.modules, [activeModule]: { cards: fn(t.modules[activeModule].cards) } },
      }));
    },
    [activeModule],
  );

  const toggleCardEnabled = useCallback(
    (cardId: string) => {
      mutateCards((cards) => cards.map((c) => (c.id === cardId ? { ...c, enabled: !c.enabled } : c)));
    },
    [mutateCards],
  );

  const toggleCardAdvanced = useCallback(
    (cardId: string) => {
      mutateCards((cards) =>
        cards.map((c) => (c.id === cardId ? { ...c, advancedOpen: !c.advancedOpen } : c)),
      );
    },
    [mutateCards],
  );

  const updateParam = useCallback(
    (cardId: string, paramKey: string, value: Param["value"]) => {
      mutateCards((cards) =>
        cards.map((c) =>
          c.id !== cardId
            ? c
            : { ...c, params: c.params.map((p) => (p.key === paramKey ? { ...p, value } : p)) },
        ),
      );
    },
    [mutateCards],
  );

  const value: Ctx = useMemo(
    () => ({
      templates,
      appliedId,
      active: working,
      activeModule,
      globalAdvanced,
      setActiveModule,
      setGlobalAdvanced,
      applyTemplate,
      saveAsTemplate,
      rename,
      remove,
      toggleCardEnabled,
      toggleCardAdvanced,
      updateParam,
    }),
    [templates, appliedId, working, activeModule, globalAdvanced, setGlobalAdvanced, applyTemplate, saveAsTemplate, rename, remove, toggleCardEnabled, toggleCardAdvanced, updateParam],
  );

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider");
  return ctx;
}
