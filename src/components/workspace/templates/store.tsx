import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Card, ModuleKey, Param, Template } from "./types";
import { SYSTEM_TEMPLATES } from "./defaults";

interface Ctx {
  templates: Template[];
  activeId: string;
  active: Template;
  activeModule: ModuleKey;
  globalAdvanced: boolean;

  setActiveId: (id: string) => void;
  setActiveModule: (m: ModuleKey) => void;
  setGlobalAdvanced: (v: boolean) => void;

  duplicateAsCustom: (name?: string) => string;
  createBlank: (name: string) => string;
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

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>(() => clone(SYSTEM_TEMPLATES));
  const [activeId, setActiveId] = useState<string>(SYSTEM_TEMPLATES[0].id);
  const [activeModule, setActiveModule] = useState<ModuleKey>("em");
  const [globalAdvanced, _setGlobalAdvanced] = useState<boolean>(false);

  const active = useMemo(
    () => templates.find((t) => t.id === activeId) ?? templates[0],
    [templates, activeId],
  );

  const setGlobalAdvanced = useCallback((v: boolean) => {
    _setGlobalAdvanced(v);
    setTemplates((prev) =>
      prev.map((t) =>
        t.id !== activeId
          ? t
          : {
              ...t,
              modules: Object.fromEntries(
                Object.entries(t.modules).map(([k, m]) => [
                  k,
                  { cards: m.cards.map((c) => ({ ...c, advancedOpen: v })) },
                ]),
              ) as Template["modules"],
            },
      ),
    );
  }, [activeId]);

  const duplicateAsCustom = useCallback(
    (name?: string) => {
      const src = templates.find((t) => t.id === activeId)!;
      const id = newId();
      const copy: Template = {
        ...clone(src),
        id,
        name: name ?? `${src.name}（副本）`,
        isSystem: false,
      };
      setTemplates((p) => [...p, copy]);
      setActiveId(id);
      return id;
    },
    [templates, activeId],
  );

  const createBlank = useCallback((name: string) => {
    const id = newId();
    const blank: Template = {
      id,
      name,
      isSystem: false,
      modules: { em: { cards: [] }, thermal: { cards: [] }, stress: { cards: [] }, nvh: { cards: [] } },
    };
    setTemplates((p) => [...p, blank]);
    setActiveId(id);
    return id;
  }, []);

  const rename = useCallback((id: string, name: string) => {
    setTemplates((p) => p.map((t) => (t.id === id && !t.isSystem ? { ...t, name } : t)));
  }, []);

  const remove = useCallback(
    (id: string) => {
      setTemplates((p) => {
        const tpl = p.find((t) => t.id === id);
        if (!tpl || tpl.isSystem) return p;
        const next = p.filter((t) => t.id !== id);
        if (activeId === id) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const mutateCards = useCallback(
    (fn: (cards: Card[]) => Card[]) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id !== activeId
            ? t
            : {
                ...t,
                modules: { ...t.modules, [activeModule]: { cards: fn(t.modules[activeModule].cards) } },
              },
        ),
      );
    },
    [activeId, activeModule],
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

  const value: Ctx = {
    templates,
    activeId,
    active,
    activeModule,
    globalAdvanced,
    setActiveId,
    setActiveModule,
    setGlobalAdvanced,
    duplicateAsCustom,
    createBlank,
    rename,
    remove,
    toggleCardEnabled,
    toggleCardAdvanced,
    updateParam,
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider");
  return ctx;
}
