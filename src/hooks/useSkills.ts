import { useState, useEffect } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { Skill } from '@/types/tarkov';

interface UseSkillsReturn {
  skills: Skill[];
  skillsMap: Map<string, Skill>;
  loading: boolean;
  error: string | null;
  getSkillImage: (skillName: string) => string | null;
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsMap, setSkillsMap] = useState<Map<string, Skill>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedSkills = await tarkovApi.getSkills();
        setSkills(fetchedSkills);
        
        // Criar mapa de nome -> skill para busca rápida
        const map = new Map<string, Skill>();
        fetchedSkills.forEach(skill => {
          map.set(skill.name, skill);
          // Também mapear possíveis variações do nome
          map.set(skill.name.toLowerCase(), skill);
          map.set(skill.name.replace(/\s+/g, ''), skill); // Sem espaços
          map.set(skill.name.replace(/\s+/g, '').toLowerCase(), skill); // Sem espaços e minúsculo
        });
        setSkillsMap(map);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const getSkillImage = (skillName: string): string | null => {
    if (!skillName) return null;
    
    // Tentar encontrar a skill por nome exato
    let skill = skillsMap.get(skillName);
    
    // Se não encontrar, tentar variações
    if (!skill) {
      skill = skillsMap.get(skillName.toLowerCase()) ||
              skillsMap.get(skillName.replace(/\s+/g, '')) ||
              skillsMap.get(skillName.replace(/\s+/g, '').toLowerCase());
    }
    
    return skill?.imageLink || null;
  };

  return {
    skills,
    skillsMap,
    loading,
    error,
    getSkillImage,
  };
}
