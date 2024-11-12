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

  // Get multiple rules from rulesObject
  const getMultipleRules = (rulesObject, keys) => {
    const rules = {}
    keys.forEach(key => {
      if(rulesObject[key]) {
        rules[key] = getRules(rulesObject[key])
      }
    })

    return rules
  }

  // Function to check a value against an array of rules
  const checkValueAgainstRules = (value, rules) => {
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        return false; // Return the error message if the rule fails
      }
    }
    return true; // Return true if all rules pass
  };

  // Function to check all values in an array against the rules
  const checkAllValuesAgainstRules = (values, rules) => {
    const errors = [];
    for (const value of values) {
      const result = checkValueAgainstRules(value, rules);
      if (result !== true) {
        errors.push(result);
      }
    }
    return errors.length === 0 ? true : errors;
  };

  // Function to check all values in an array of objects against the rules
const checkMultipleValuesAgainstRules = (values, rules) => {
  const errors = [];

  for (const value of values) {
    const valueErrors = {};

    for (const key in value) {
      if (rules[key]) {
        const result = checkValueAgainstRules(value[key], rules[key]);
        if (result !== true) {
          valueErrors[key] = result;
        }
      }
    }

    if (Object.keys(valueErrors).length > 0) {
      errors.push(valueErrors);
    }
  }

  return errors.length === 0 ? true : errors;
};

  return {
    getRules,
    getMultipleRules,
    checkAllValuesAgainstRules,
    checkMultipleValuesAgainstRules
  }
}