export default function useRules() {

  // Get rules from rulesList
  const getRules = (rulesList) => {
    const rules = []
    const rs = {}
    rulesList.forEach(rule => {
        const f = new Function('v', `return ${rule.regex}`)
        rs[rule.id] = v => f(v) || rule.message
        rules.push(rs[rule.id])
    });

    return rules
  }

  return {
    getRules
  }
}