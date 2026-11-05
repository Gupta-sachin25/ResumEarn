/**
 * Abstract Base Job Source Interface
 */
export class BaseJobSource {
  constructor(name) {
    this.name = name;
  }

  /**
   * Discovers and retrieves job opportunities.
   * @param {Object} profile - Candidate profile
   * @param {string} query - Optional search query
   * @returns {Promise<Array<Object>>}
   */
  async search(profile, query = '') {
    throw new Error('Method search() must be implemented by subclass');
  }
}

