export const slugify = (v: string, typing = false) => {
  const s = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "").slice(0, 40);
  return typing ? s : s.replace(/-+$/g, "");
};
